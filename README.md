# tinypg-trace-plugin
[Stackdriver Trace](https://github.com/googleapis/cloud-trace-nodejs) plugin for [TinyPg](https://github.com/joeandaverde/tinypg)

## Usage
Include `tinypg-trace-plugin` in the the plugins object that gets passed to the trace agent on start
```
require('@google-cloud/trace-agent').start({
   plugins: {
      'tinypg': 'tinypg-trace-plugin',
      'pg': false, // pg spans are uncorrelated to tinypg spans so it works best when the pg plugin is disabled
      ...
   }
})
```

## What gets traced?
This plugin monkey patches `TinyPg`'s `sql` function.

## Labels
   * `row_count` - Number of rows returned from the `sql` call
   * `source` - tinypg
   * `error` - Any errors thrown from the `sql` call
