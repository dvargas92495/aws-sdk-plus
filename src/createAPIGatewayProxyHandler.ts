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
      })
    ).then((res) => ({
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
      },
    }));

export default createAPIGatewayProxyHandler;
