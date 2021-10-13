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
        ...(event.requestContext.authorizer || {})
      })
    )
      .then((res) => ({
        statusCode: 200,
        body: JSON.stringify(res),
        headers: {
          "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
        },
      }))
      .catch((e) => ({
        statusCode: e.code || 500,
        body: e.message,
        headers: {
          "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
        },
      }));

export default createAPIGatewayProxyHandler;
