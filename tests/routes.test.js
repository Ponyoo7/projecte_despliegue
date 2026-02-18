import request from "supertest";
import app from "../index.js";
import { initializeDB } from "../lib/db.js";
import mongoose from "mongoose";

beforeAll(async () => {
  await initializeDB();
});
//hola
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Public Routes", () => {
  it("should return 200/302 for homepage (redirects or shows content)", async () => {
    const res = await request(app).get("/pintores");
    expect([200, 302, 401]).toContain(res.statusCode);
  });

  it("should access /museos", async () => {
    const res = await request(app).get("/museos");
    expect([200, 302, 401]).toContain(res.statusCode);
  });
});
//bcuidsjhnf
