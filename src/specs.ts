export interface Document {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: { [path: string]: PathItemObject };
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}

export interface ServerObject {
  url: string;
  description?: string;
  variables?: { [variable: string]: ServerVariableObject };
}

export interface ServerVariableObject {
  enum?: string[];
  default: string;
  description?: string;
}

export interface PathObject {
  [pattern: string]: PathItemObject;
}

export interface PathItemObject {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: Array<ReferenceObject | ParameterObject>;
}

export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: Array<ReferenceObject | ParameterObject>;
  requestBody?: ReferenceObject | RequestBodyObject;
  responses?: ResponsesObject;
  callbacks?: { [callback: string]: ReferenceObject | CallbackObject };
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface ParameterObject extends ParameterBaseObject {
  name: string;
  in: string;
}

export interface HeaderObject extends ParameterBaseObject {}

interface ParameterBaseObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: ReferenceObject | SchemaObject;
  example?: any;
  examples?: { [media: string]: ReferenceObject | ExampleObject };
  content?: { [media: string]: MediaTypeObject };
}
export type NonArraySchemaObjectType =
  | "null"
  | "boolean"
  | "object"
  | "number"
  | "string"
  | "integer";
export type ArraySchemaObjectType = "array";
export type SchemaObject = ArraySchemaObject | NonArraySchemaObject;

interface ArraySchemaObject extends BaseSchemaObject {
  type: ArraySchemaObjectType;
  items: ReferenceObject | SchemaObject;
}

interface NonArraySchemaObject extends BaseSchemaObject {
  type: NonArraySchemaObjectType;
}

interface BaseSchemaObject {
  // JSON schema allowed properties, adjusted for OpenAPI
  title?: string;
  description?: string;
  format?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalProperties?: boolean | ReferenceObject | SchemaObject;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  properties?: {
    [name: string]: SchemaObject;
  };
  allOf?: Array<ReferenceObject | SchemaObject>;
  oneOf?: Array<ReferenceObject | SchemaObject>;
  anyOf?: Array<ReferenceObject | SchemaObject>;
  not?: ReferenceObject | SchemaObject;

  // OpenAPI-specific properties
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  deprecated?: boolean;
}

export interface DiscriminatorObject {
  propertyName: string;
  mapping?: { [value: string]: string };
}

export interface XMLObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface ReferenceObject {
  $ref: string;
}

export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface MediaTypeObject {
  schema?: ReferenceObject | SchemaObject;
  example?: any;
  examples?: { [media: string]: ReferenceObject | ExampleObject };
  encoding?: { [media: string]: EncodingObject };
}

export interface EncodingObject {
  contentType?: string;
  headers?: { [header: string]: ReferenceObject | HeaderObject };
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

export interface RequestBodyObject {
  description?: string;
  content: { [media: string]: MediaTypeObject };
  required?: boolean;
}

export interface ResponsesObject {
  [code: string]: ReferenceObject | ResponseObject;
}

export interface ResponseObject {
  description: string;
  headers?: { [header: string]: ReferenceObject | HeaderObject };
  content?: { [media: string]: MediaTypeObject };
  links?: { [link: string]: ReferenceObject | LinkObject };
}

export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: { [parameter: string]: any };
  requestBody?: any;
  description?: string;
  server?: ServerObject;
}

export interface CallbackObject {
  [url: string]: PathItemObject;
}

export interface SecurityRequirementObject {
  apiKey?: string[];
  http?: string[];
  oauth2?: string[];
  openIdConnect?: string[];
}

export interface ComponentsObject {
  schemas?: { [key: string]: ReferenceObject | SchemaObject };
  responses?: { [key: string]: ReferenceObject | ResponseObject };
  parameters?: { [key: string]: ReferenceObject | ParameterObject };
  examples?: { [key: string]: ReferenceObject | ExampleObject };
  requestBodies?: { [key: string]: ReferenceObject | RequestBodyObject };
  headers?: { [key: string]: ReferenceObject | HeaderObject };
  securitySchemes?: { [key: string]: ReferenceObject | SecuritySchemeObject };
  links?: { [key: string]: ReferenceObject | LinkObject };
  callbacks?: { [key: string]: ReferenceObject | CallbackObject };
}

export type SecuritySchemeObject =
  | HttpSecurityScheme
  | ApiKeySecurityScheme
  | OAuth2SecurityScheme
  | OpenIdSecurityScheme;

export interface HttpSecurityScheme {
  type: "http";
  description?: string;
  scheme: string;
  bearerFormat?: string;
}

export interface ApiKeySecurityScheme {
  type: "apiKey";
  description?: string;
  name: string;
  in: string;
}

export interface OAuth2SecurityScheme {
  type: "oauth2";
  flows: {
    implicit?: {
      authorizationUrl: string;
      refreshUrl?: string;
      scopes: { [scope: string]: string };
    };
    password?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: { [scope: string]: string };
    };
    clientCredentials?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: { [scope: string]: string };
    };
    authorizationCode?: {
      authorizationUrl: string;
      tokenUrl: string;
      refreshUrl?: string;
      scopes: { [scope: string]: string };
    };
  };
}

export interface OpenIdSecurityScheme {
  type: "openIdConnect";
  description?: string;
  openIdConnectUrl: string;
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}
