import type { APIGatewayProxyHandler } from "aws-lambda";
import emailError from "./emailError";

const excludeCors = (headers: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([h]) => h.toLowerCase() !== "access-control-allow-origin"
    )
  );

const createAPIGatewayProxyHandler =
  <T extends Record<string, unknown>, U extends Record<string, unknown>>(
    fcn: (e: T) => string | U | Promise<U | string>
  ): APIGatewayProxyHandler =>
  (event) =>
    new Promise<U | string>((resolve, reject) => {
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
      .then((response) => {
        if (typeof response === "object") {
          const { headers, code, ...res } = response;

          const statusCode =
            typeof code === "number" && code >= 200 && code < 400 ? code : 200;
          return {
            statusCode,
            body: JSON.stringify(res),
            headers: {
              "Access-Control-Allow-Origin": process.env.ORIGIN || "*",
              ...(typeof headers === "object" && headers
                ? excludeCors(headers as Record<string, unknown>)
                : {}),
            },
          };
        } else {
          return {
            statusCode: 200,
            body: response,
            headers: {
              "Access-Control-Allow-Origin": process.env.ORIGIN || "*",
            },
          };
        }
      })
      .catch((e) => {
        console.error(e);
        const statusCode =
          typeof e.code === "number" && e.code >= 400 && e.code < 600
            ? e.code
            : 500;
        const headers = {
          "Access-Control-Allow-Origin": process.env.ORIGIN || "*",
          ...(typeof e.headers === "object" ? excludeCors(e.headers) : {}),
        };
        const userResponse = {
          statusCode,
          body: e.message,
          headers,
        };
        if (statusCode >= 400 && statusCode < 500) {
          return userResponse;
        }
        return typeof e.name === "string" && e.name
          ? emailError(e.name, e).then((id) => ({
              statusCode,
              body: `Unknown error - Message Id ${id}`,
              headers,
            }))
          : userResponse;
      });

export default createAPIGatewayProxyHandler;
