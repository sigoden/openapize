import * as path from "path";
import { loadAPIFile, loadAPIs } from "../src/api";

describe("loadAPIFile", () => {
  test("should load openapi file", async () => {
    const api = await loadAPIFile(
      path.resolve(__dirname, "fixtures/petstore.yaml")
    );
    expect(api.openapi).toBe("3.0.0");
  });
});

describe("loadAPIs", () => {
  test("should load openapi file and parse apis", async () => {
    const apis = await loadAPIs(
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
});
