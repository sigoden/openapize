import * as types from "./types";
import { Request, Response, IRouter, NextFunction, RequestHandler } from "express";

import trimEnd = require("lodash.trimend");
import { loadAPIs, parseAPIs } from "./api";

const unauthorized = (req: Request, res: Response, next: NextFunction) => {
  res.status(401);
  next(new SecurityError("Unauthorized"));
};

const pickMap = {
  query: "query",
  header: "headers",
  path: "params",
  cookie: "cookies",
  requestBody: "body"
};

export class ValidationError extends Error {
  public readonly errors: types.ErrorObject[];
  constructor(msg, errors: types.ErrorObject[]) {
    super(msg);
    this.errors = errors;
  }
}

export class SecurityError extends Error {
  constructor(msg) {
    super(msg);
  }
}

export async function openapize<T>(router: IRouter<T>, options: types.Options) {
  let apis: types.API[];
  if (typeof options.api === "string") {
    apis = await loadAPIs(options.api);
  } else {
    apis = await parseAPIs(options.api);
  }
  apis.forEach(api => {
    const handler = options.handlers && options.handlers[api.name];
    const security =
      options.security && api.security && options.security[api.security.name];
    if (options.mapAPI) {
      api = options.mapAPI(api);
    }
    if (handler) {
      mountAPI<T>(router, api, handler, security);
    } else {
      const fn = options.noHandlerAPI || (() => {});
      fn(api);
    }
  });
}

function mountAPI<T>(
  router: IRouter<T>,
  api: types.API,
  handler?: RequestHandler,
  security?: RequestHandler
) {
  const mountPath = trimEnd(api.path.replace(/{([^}]+)}/g, ":$1"), "/");
  const handlerFuncs = [];
  handlerFuncs.push((req: Request, res: Response, next: NextFunction) => {
    req.openapi = api;
    next();
  });
  if (api.security) {
    handlerFuncs.push(security ? security : unauthorized);
  }
  const validatorKinds = Object.keys(api.validator);
  if (validatorKinds.length > 0) {
    handlerFuncs.push((req: Request, res: Response, next: NextFunction) => {
      const errors = [];
      validatorKinds.map(kind => {
        const validate = <types.Validate>api.validator[kind];
        const key = pickMap[kind];
        if (!validate(req[key], key)) {
          errors.push(...validate.errors);
        }
      });
      if (errors.length > 0) {
        next(new ValidationError("Validation failed", errors));
      } else {
        next();
      }
    });
  }
  handlerFuncs.push(handler);
  router[api.method].apply(router, [mountPath, ...handlerFuncs]);
}

export * from "./types";
