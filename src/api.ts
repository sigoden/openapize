import * as types from "./types";
import * as SwaggerParser from "swagger-parser";
import capitalize = require("lodash.capitalize");
import parse = require("./parse");

const parser = new SwaggerParser();
const METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace"
];

export async function loadAPIFile(file: string) {
  const obj = await parser.dereference(file);
  if (!obj.openapi) {
    throw new Error(`not satisfied openapi spec, parse ${file}`);
  }
  return <types.Document>obj;
}

export async function loadAPIs(file: string) {
  const spec = await loadAPIFile(file);
  return parseAPIs(spec);
}

export function parseAPIs(spec: types.Document) {
  const apis: types.API[] = [];
  Object.keys(spec.paths).forEach(urlPath => {
    const pathItemObj = spec.paths[urlPath];
    Object.keys(pathItemObj).forEach(method => {
      if (METHODS.indexOf(method) > -1) {
        const api: types.API = <any>{ method, path: urlPath };
        const operationObj = <types.OperationObject>pathItemObj[method];
        mergeParameters(pathItemObj, operationObj);
        api.name = operationObj.operationId
          ? operationObj.operationId
          : genOpName(method, urlPath);
        operationObj.security = operationObj.security || spec.security;
        if (operationObj.security && operationObj.security.length > 0) {
          const securityObj = operationObj.security[0];
          const securityName = Object.keys(securityObj)[0];
          api.security = <types.Security>{
            name: securityName,
            value: securityObj[securityName]
          };
        }
        api.validator = createValidator(operationObj);
        apis.push(api);
      }
    });
  });
  return apis;
}

function mergeParameters(
  operationObj: types.OperationObject,
  pathItemObj: types.PathItemObject
) {
  if (!pathItemObj.parameters || pathItemObj.parameters.length === 0) {
    return;
  }
  const pathItemParams = <types.ParameterObject[]>pathItemObj.parameters;
  const operationParams = <types.ParameterObject[]>(operationObj.parameters || []);
  for (const pathItemParam of pathItemParams) {
    if (
      operationParams.find(
        p => p.in === pathItemParam.in && p.name === pathItemParam.name
      )
    ) {
      continue;
    }
    operationParams.push(pathItemParam);
  }
}

function genOpName(method: string, urlPath: string) {
  const pathSegs = urlPath
    .slice(1)
    .replace(/\{|\}/g, "")
    .split("/")
    .map(capitalize);
  return [method, ...pathSegs].join("");
}

function createValidator(operationObj: types.OperationObject) {
  const validator: types.Validator = <any>{};
  if (operationObj.parameters) {
    const parameters = <types.ParameterObject[]>operationObj.parameters;
    setParameterValiator(validator, "query", parameters);
    setParameterValiator(validator, "header", parameters);
    setParameterValiator(validator, "path", parameters);
    setParameterValiator(validator, "cookie", parameters);
  }
  if (operationObj.requestBody) {
    const requestBody = <types.RequestBodyObject>operationObj.requestBody;
    setRequestBodyValidator(validator, requestBody);
  }
  return validator;
}

function setParameterValiator(
  validator: types.Validator,
  kind: string,
  parameters: types.ParameterObject[]
) {
  const kindOfParameters = parameters.filter(p => p.in === kind);
  if (kindOfParameters.length === 0) {
    return;
  }
  const schema = kindOfParameters.reduce((s, p) => {
    s[p.name] = p.schema;
    return s;
  }, {});
  validator[kind] = <types.Validate>parse.compile(schema);
}

function setRequestBodyValidator(
  validator: types.Validator,
  requestBody: types.RequestBodyObject
) {
  const mediaTypeObj = requestBody.content[Object.keys(requestBody.content)[0]];
  validator.requestBody = <types.Validate>parse.compile(mediaTypeObj.schema);
}
