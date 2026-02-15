import mongoose from "mongoose"; // Librería para modelar objetos de MongoDB
import User from "../models/user.model.js";
import { encryptPassword } from "./auth.js";

export const initializeDB = () => {
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  mongoose
    .connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, {
      authSource: "admin",
      user: dbUser,
      pass: dbPassword,
    })
    .then(() => {
      console.log("Conectado a la base de datos");

      createAdminUser();
    });
};

export const createAdminUser = async () => {
  const adminName = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  const adminUser = await User.findOne({
    username: adminName,
  });

  if (!adminUser) {
    await User.create({
      username: adminName,
      password: await encryptPassword(adminPassword),
      email: adminEmail,
      role: "admin",
    });
  }
};
