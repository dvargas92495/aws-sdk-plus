import type { APIGatewayProxyHandler } from "aws-lambda";

const createAPIGatewayProxyHandler =
  <T extends Record<string, unknown>, U extends Record<string, unknown>>(
    fcn: (e: T) => U | Promise<U>
  ): APIGatewayProxyHandler =>
  (event) =>
    Promise.resolve(
      fcn({
        ...JSON.parse(event.body || "{}"),
        ...(event.queryStringParameters || {}),
        ...(event.requestContext.authorizer || {}),
      })
    )
      .then(({ headers, code, ...res }) => ({
        statusCode:
          typeof code === "number" && code >= 200 && code < 400 ? code : 200,
        body: JSON.stringify(res),
        headers: {
          "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
          ...(typeof headers === "object" ? headers : {}),
        },
      }))
      .catch((e) => ({
        statusCode:
          typeof e.code === "number" && e.code >= 400 && e.code < 600
            ? e.code
            : 500,
        body: e.message,
        headers: {
          "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
          ...(typeof e.headers === "object" ? e.headers : {}),
        },
      }));

export default createAPIGatewayProxyHandler;
