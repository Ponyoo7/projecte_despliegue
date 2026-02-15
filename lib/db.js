import mongoose from "mongoose"; // Librería para modelar objetos de MongoDB
import User from "../models/user.model.js";
import { encryptPassword } from "./auth.js";

export const initializeDB = async () => {
  const mongodbUri = process.env.MONGODB_URI;

  const connectionPromise = mongodbUri
    ? mongoose.connect(mongodbUri)
    : mongoose.connect(
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {
        authSource: "admin",
        user: process.env.DB_USER,
        pass: process.env.DB_PASSWORD,
      }
    );
  //dev
  return connectionPromise.then(async () => {
    console.log("Conectado a la base de datos");
    await createAdminUser();
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
