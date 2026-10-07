import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Colivingly API",
    description: "Auto-generated OpenAPI documentation for Colivingly backend",
    version: "1.0.0",
  },
  host: "localhost:5000", // Update with your port/host
  schemes: ["http", "https"],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger-output.json";

// Point this to your main app file or the root router file where routes are mounted
const routes = ["./src/server.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
