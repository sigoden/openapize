import { Request, NextFunction } from "express-serve-static-core";
import * as Ajv from "ajv";
import * as specs from "./specs";

export interface RequestExt extends Request {
  openapi: API;
};

export interface RequestHandler {
    // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2
    (req: RequestExt, res: Response, next: NextFunction): any;
}

export type Method =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export interface Security {
  name: string;
  value: string[];
}

export interface Validator {
  query?: Validate;
  header?: Validate;
  path?: Validate;
  cookie?: Validate;
  requestBody: Validate;
}

export type Validate = Ajv.ValidateFunction;

export type ErrorObject = Ajv.ErrorObject;

export interface API {
  name: string;
  path: string;
  method: Method;
  security?: Security;
  validator: Validator;
  tags?: string[];
}

export interface Options {
  api: string | specs.Document;
  // handler funcs
  handlers?: HandlerFuncMap;
  // security middleware funcs
  security?: HandlerFuncMap;
  // hook to modify api
  mapAPI?: (api: API) => API;
  // no handler for api
  noHandlerAPI?: (api: API) => any;
}

export interface HandlerFuncMap {
  [k: string]: RequestHandler;
}

export * from "./specs";
