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
        operationObj.parameters = operationObj.parameters || [];
        mergeParameters(pathItemObj, operationObj);
        api.name = operationObj.operationId
          ? operationObj.operationId
          : genOpName(method, urlPath);
        operationObj.security = operationObj.security || spec.security;
        api.tags = operationObj.tags;
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
  pathItemObj: types.PathItemObject,
  operationObj: types.OperationObject
) {
  if (!pathItemObj.parameters || pathItemObj.parameters.length === 0) {
    return;
  }
  const pathItemParams = <types.ParameterObject[]>pathItemObj.parameters;
  const operationParams = <types.ParameterObject[]>operationObj.parameters;
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
  const operationId = operationObj.operationId;
  if (operationObj.parameters) {
    const parameters = <types.ParameterObject[]>operationObj.parameters;
    setParameterValiator(validator, operationId, "query", parameters);
    setParameterValiator(validator, operationId, "header", parameters);
    setParameterValiator(validator, operationId, "path", parameters);
    setParameterValiator(validator, operationId, "cookie", parameters);
  }
  if (operationObj.requestBody) {
    const requestBody = <types.RequestBodyObject>operationObj.requestBody;
    setRequestBodyValidator(validator, operationId, requestBody);
  }
  return validator;
}

function setParameterValiator(
  validator: types.Validator,
  operationId: string,
  kind: string,
  parameters: types.ParameterObject[]
) {
  const kindOfParameters = parameters.filter(p => p.in === kind);
  if (kindOfParameters.length === 0) {
    return;
  }
  const schema = kindOfParameters.reduce(
    (s, p) => {
      s.properties[p.name] = p.schema;
      if (p.required) {
        s.required.push(p.name);
      }
      return s;
    },
    { type: "object", properties: {}, required: [] }
  );
  try {
    validator[kind] = <types.Validate>parse.compile(schema);
  } catch (err) {
    throw new Error(
      `schema at ${operationId}.${kind} is invalid, err ${err.message}`
    );
  }
}

function setRequestBodyValidator(
  validator: types.Validator,
  operationId: string,
  requestBody: types.RequestBodyObject
) {
  const mediaTypeObj = requestBody.content[Object.keys(requestBody.content)[0]];
  try {
    validator.requestBody = <types.Validate>parse.compile(mediaTypeObj.schema);
  } catch (err) {
    throw new Error(
      `schema at ${operationId}.requestBody is invalid, err ${err.message}`
    );
  }
}
