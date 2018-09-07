export type Method =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch";

export type Security = {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  value: string[];
};

export interface API {
  name: string;
  path: string;
  method: Method;
  security: Security;
  validate: (data: any) => void;
}
