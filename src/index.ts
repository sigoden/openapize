import * as OpenAPI from "./specs";
import * as types from "./types";
import * as SwaggerParser from "swagger-parser";

const parser = new SwaggerParser();

export function parseAPIs(spec: OpenAPI.Document) {
  Object.keys(spec.paths).map(urlPath => {

  })
}

export async function loadAPIFile(file: string) {
  const obj = await parser.dereference(file);
  if (!obj.openapi) {
    throw new Error(`not satisfied openapi spec, parse ${file}`);
  }
  return <OpenAPI.Document>obj;
}

export async function loadAPIs(file: string) {
  const spec = await loadAPIFile(file);
  return parseAPIs(spec);
}

export * from "./specs";
export * from "./types";
