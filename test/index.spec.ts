import * as Openapize from "../src/";
import * as express from "express";
import * as path from "path";
import * as supertest from "supertest";
import * as bodyParser from "body-parser";

async function initApp(app: express.Router) {
  app.use(bodyParser.json());
  await Openapize.openapize(app, {
    api: path.resolve(__dirname, "fixtures/petstore.yaml"),
    handlers: require("./fixtures/handlers"),
    security: require("./fixtures/security")
  });
}

describe("bind route", () => {
  const app = express();
  beforeAll(async () => {
    await initApp(app);
  });

  test("should bind postPet", async () => {
    const res = await supertest(app)
      .post("/pets")
      .set("authorization", "Bearer ...")
      .send({ id: 0, name: "Cat" });
    expect(res.body).toEqual({ id: 0, name: "Cat" });
  });
  test("should bind listPets", async () => {
    const res = await supertest(app).get("/pets");
    expect(res.body).toEqual([{ id: 0, name: "Cat" }]);
  });
  test("should bind showPetById", async () => {
    const res = await supertest(app).get("/pets/0");
    expect(res.body).toEqual({ id: 0, name: "Cat" });
  });
});

describe("check security", () => {
  const app = express();
  beforeAll(async () => {
    await initApp(app);
    app.use(<ErrorRequestHandler>(err, req, res, next) => {
      res.json({ err: err.message });
    });
  });
  test("should call security handler", async () => {
    const res = await supertest(app)
      .post("/pets")
      .send({ id: 1, name: "Cat" });
    expect(res.status).toEqual(403);
    expect(res.body).toEqual({ err: "No permision" });
  });
});

describe("validate input", () => {
  const app = express();
  beforeAll(async () => {
    await initApp(app);
    app.use(<ErrorRequestHandler>(err, req, res, next) => {
      res.json({ err: err.errors });
    });
  });
  test("should throw validate error", async () => {
    const res = await supertest(app)
      .post("/pets")
      .set("authorization", "Bearer ...")
      .send({ id: "1", name: "Cat" });
    expect(res.body).toEqual({
      err: [
        {
          dataPath: "body.id",
          keyword: "type",
          message: "should be integer",
          params: { type: "integer" },
          schemaPath: "#/properties/id/type"
        }
      ]
    });
  });
});
