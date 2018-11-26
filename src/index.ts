import { PluginTypes } from '@google-cloud/trace-agent'
import * as Tiny from 'tinypg'
import * as shimmer from 'shimmer'
import * as _ from 'lodash'

function patchTiny(tiny: any, tracer) {
   shimmer.wrap(tiny.TinyPg.prototype, 'sql', sql => {
      return function tiny_trace(this) {
         if (_.isEmpty(arguments)) {
            return sql.apply(this, arguments)
         }

         const args: any[] = Array.prototype.slice.call(arguments, 0)
         // args[0] should be name of file
         const trace_name = _.isNil(args[0]) ? 'tinypg_sql' : `${args[0]}`

         const span = tracer.createChildSpan({ name: trace_name })
         span.addLabel('source', 'tinypg')

         if (!tracer.isRealSpan(span)) {
            return sql.apply(this, arguments)
         }

         const wrapped_sql = tracer.wrap(sql)

         const sql_result: Promise<Tiny.Result<any>> = wrapped_sql.apply(this, arguments)

         return sql_result.then(
            res => {
               span.addLabel('row_count', res.row_count)
               span.endSpan()

               return res
            },
            err => {
               span.addLabel('error', err)
               span.endSpan()

               throw err
            }
         )
      }
   })
}

function unpatch(tiny) {
   shimmer.unwrap(tiny.TinyPg.prototype, 'sql')
}

const plugin: PluginTypes.Plugin = [
   {
      file: '',
      patch: patchTiny,
      unpatch: unpatch,
   },
]

export = plugin
