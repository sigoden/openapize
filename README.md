# Openapize

Mount rest api depends on OpenAPI doc file for express app.

## Getting started

```js
const openapize = require("@sigodenjs/openapize");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

openapize(app, {
  // openapi file
  api: require("./fixtures/defs/pets.json"),
  // handler funcs
  handlers: require("./handlers"),
  // security middleware funcs
  security: require("./security"),
  // hook to modify api
  mapAPI: function(api) {
    return api;
  },
  // no handler for api
  noHandlerAPI: function(api) {

  }
});
```

## Limit

- `ParameterObject` does not support `content`
- `RequestBodyObject.content` has at most one `MeidaObject`
- `OperationObject.security` has at most one `securitySchemes`

## Licese

Copyright (c) 2018 sigoden

Licensed under the MIT license.
