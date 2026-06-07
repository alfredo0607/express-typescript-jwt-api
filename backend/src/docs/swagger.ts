import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import { env } from "../config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express TypeScript JWT API",
      version: "1.0.0",
      description: "API REST con autenticación JWT RS256, RBAC y Rate Limiting",
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: "Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Application): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
  app.get("/api/docs.json", (_req, res) => res.json(spec));
}
