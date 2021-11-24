import type { APIGatewayProxyHandler } from "aws-lambda";

const excludeCors = (headers: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([h]) => h.toLowerCase() !== "access-control-allow-origin"
    )
  );

const createAPIGatewayProxyHandler =
  <T extends Record<string, unknown>, U extends Record<string, unknown>>(
    fcn: (e: T) => U | Promise<U>
  ): APIGatewayProxyHandler =>
  (event) =>
    new Promise<U>((resolve, reject) => {
      try {
        resolve(
          fcn({
            ...JSON.parse(event.body || "{}"),
            ...(event.queryStringParameters || {}),
            ...(event.requestContext.authorizer || {}),
          })
        );
      } catch (e) {
        reject(e);
      }
    })
      .then(({ headers, code, ...res }) => ({
        statusCode:
          typeof code === "number" && code >= 200 && code < 400 ? code : 200,
        body: JSON.stringify(res),
        headers: {
          "Access-Control-Allow-Origin": process.env.HOST || "*",
          ...(typeof headers === "object" && headers
            ? excludeCors(headers as Record<string, unknown>)
            : {}),
        },
      }))
      .catch((e) => ({
        statusCode:
          typeof e.code === "number" && e.code >= 400 && e.code < 600
            ? e.code
            : 500,
        body: e.message,
        headers: {
          "Access-Control-Allow-Origin": process.env.HOST || "*",
          ...(typeof e.headers === "object" ? excludeCors(e.headers) : {}),
        },
      }));

export default createAPIGatewayProxyHandler;
