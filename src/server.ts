import "dotenv/config";
import cors from "@fastify/cors";
import fastify from "fastify";
import { memoriesRoutes } from "./routes/memories";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";
import multipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload";
import { resolve } from "node:path";

const app = fastify();

app.register(multipart);

app.register(require("@fastify/static"), {
  root: resolve(__dirname, "../uploads"),
  prefix: "/uploads",
});

app.register(memoriesRoutes);
app.register(authRoutes);
app.register(uploadRoutes);

app.register(jwt, {
  secret: "spacetime",
});

app.register(cors, {
  origin: true,
});

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🚀 HTTP Server is running => http://localhost:3333");
  });
