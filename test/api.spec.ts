import * as path from "path";
import { parseAPIs } from "../src/api";

describe("parseAPIs", () => {
  test("should parse apis from file", async () => {
    const apis = await parseAPIs(
      path.resolve(__dirname, "fixtures/petstore.yaml")
    );
    expect(apis).toHaveLength(3);
    const listPets = apis[0];
    expect(listPets.name).toBe("listPets");
    expect(listPets.method).toBe("get");
    expect(listPets.path).toBe("/pets");
    expect(listPets.security).toBeUndefined();
    expect(listPets.validator.query({ limit: 32 })).toBe(true);
    const createPets = apis[1];
    expect(createPets.name).toBe("postPets");
    expect(createPets.security).toEqual({ name: "jwt", value: [] });
    expect(createPets.validator.requestBody({ id: 33, name: "puppy" })).toBe(
      true
    );
  });
  test("should parse apis from api object", async () => {
    const apiObj = require("./fixtures/petstore.json");
    const apis = await parseAPIs(apiObj);
    expect(apis).toHaveLength(3);
  })
});
