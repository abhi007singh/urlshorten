import swaggerAutogen from "swagger-autogen";

const doc = {
  components: {
    responses: {
      NotFound: {
        content: {
          "application/json": {
            schema: {
              properties: {
                error: {
                  example: "Not Found",
                  type: "string",
                },
              },
              type: "object",
            },
          },
        },
        description: "Resource not found.",
      },
      ServerError: {
        content: {
          "application/json": {
            schema: {
              properties: {
                error: {
                  example: "Internal Server Error",
                  type: "string",
                },
              },
              type: "object",
            },
          },
        },
        description: "Internal server error.",
      },
      ValidationError: {
        content: {
          "application/json": {
            schema: {
              properties: {
                error: {
                  example: "Validation Error",
                  type: "string",
                },
              },
              type: "object",
            },
          },
        },
        description: "Validation error.",
      },
    },
    securitySchemes: {
      // JWT: {
      //   bearerFormat: "JWT",
      //   scheme: "bearer",
      //   type: "http",
      // },
      cookieAuth: {
        in: "cookie",
        name: "auth_token",
        type: "apiKey",
      }
    },
  },
  host: "localhost:3000",
  info: {
    description: "Url shortener app using typescript, mongoose, node.js",
    title: "Url Shorten",
    version: "1.0.0",
  },
  security: [
    // {
    //   JWT: [] as any,
    // },
    {
      cookieAuth: [] as any
    }
  ],
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["./src/routes/index.ts"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
