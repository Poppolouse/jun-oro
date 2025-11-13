/**
 * @fileoverview Swagger definition configuration
 * @description OpenAPI/Swagger specification for Jun-Oro API
 */

/**
 * Swagger definition object
 */
export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Jun-Oro Gaming Platform API",
    version: "1.0.0",
    description: "API documentation for the Jun-Oro gaming platform backend",
    contact: {
      name: "Jun-Oro Team",
      email: "support@jun-oro.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://api.jun-oro.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT authentication token",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization",
    },
    {
      name: "Games",
      description: "Game management and library operations",
    },
    {
      name: "Users",
      description: "User profile and preferences management",
    },
    {
      name: "Sessions",
      description: "Gaming session tracking and management",
    },
    {
      name: "Library",
      description: "User's game library collection",
    },
    {
      name: "Upload",
      description: "File upload and image processing",
    },
    {
      name: "Stats",
      description: "Statistics and analytics",
    },
  ],
};

export default swaggerDefinition;