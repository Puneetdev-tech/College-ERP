/**
 * tests/helpers.js
 * Shared test utilities — login helper, DB seeding, cleanup
 */
import request from "supertest";
import app from "../src/app.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

/** Login as Admin and return the JWT token. */
export async function loginAsAdmin() {
  // Find the first admin user in the DB
  const admin = await prisma.user.findFirst({ where: { role: "Admin" } });
  if (!admin) throw new Error("No Admin user found in the database. Please seed the DB first.");

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: admin.email, password: "admin" }); // default password

  if (!res.body.token) {
    // Try a secondary password if default failed
    const res2 = await request(app)
      .post("/api/auth/login")
      .send({ email: admin.email, password: "Admin@123" });
    return res2.body.token;
  }
  return res.body.token;
}

/** Login as a specific role and return the JWT token. */
export async function loginAs(role, password = "admin") {
  const user = await prisma.user.findFirst({ where: { role } });
  if (!user) return null;
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password });
  return res.body.token;
}

/** Cleanup — delete test records created during tests */
export async function cleanup(table, where) {
  try {
    await prisma[table].deleteMany({ where });
  } catch { /* ignore */ }
}

export { app, request };
