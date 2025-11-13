/**
 * @fileoverview Swagger documentation route
 * @description OpenAPI/Swagger UI endpoint
 */

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerDefinition } from "./docs/swagger.def.js";

/**
 * Swagger options
 */
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/middleware/*.js", "./src/lib/*.js"],
};

/**
 * Generate swagger specification
 */
const specs = swaggerJsdoc(swaggerOptions);

/**
 * Custom CSS for Swagger UI
 */
const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info { margin: 20px 0 }
  .swagger-ui .scheme-container { margin: 20px 0 }
`;

/**
 * Swagger UI options
 */
const swaggerUiOptions = {
  customCss,
  customSiteTitle: "Jun-Oro API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: "none",
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true,
  },
};

/**
 * Setup swagger routes
 * @param {object} app - Express app instance
 */
export const setupSwagger = (app) => {
  // Swagger UI endpoint
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(specs, swaggerUiOptions));

  // JSON specification endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  // Redirect root to docs
  app.get("/docs", (req, res) => {
    res.redirect("/api-docs");
  });
};

export default setupSwagger;
