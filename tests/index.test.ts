import createAPIGatewayProxyHandler from "../src/createAPIGatewayProxyHandler";

const MOCK_EVENT = {
  body: "",
  headers: {},
  multiValueHeaders: {},
  isBase64Encoded: false,
  httpMethod: "",
  path: "",
  pathParameters: {},
  queryStringParameters: {},
  stageVariables: {},
  multiValueQueryStringParameters: {},
  resource: "",
  requestContext: {
    accountId: "",
    apiId: "",
    httpMethod: "",
    protocol: "",
    authorizer: {},
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: "",
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: "",
    stage: "",
    requestId: "",
    requestTimeEpoch: 0,
    resourceId: "",
    resourcePath: "",
  },
};

const MOCK_CONTEXT = {
  callbackWaitsForEmptyEventLoop: false,
  awsRequestId: "",
  invokedFunctionArn: "",
  functionName: "",
  functionVersion: "",
  memoryLimitInMB: "",
  logGroupName: "",
  logStreamName: "",
  getRemainingTimeInMillis: () => 0,
  done: () => undefined,
  fail: () => undefined,
  succeed: () => undefined,
};

test("createAPIGatewayProxyHandler", (done) => {
  const lambda = ({ id }: { id: string }) => ({
    user: {
      id,
      name: "David Vargas",
    },
  });
  const handler = createAPIGatewayProxyHandler(lambda);
  const promise = handler(
    {
      ...MOCK_EVENT,
      body: JSON.stringify({ id: 4 }),
    },
    MOCK_CONTEXT,
    () => null
  );
  if (!promise) {
    fail("Must return an API result");
  }
  promise.then((response) => {
    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    expect(JSON.parse(response.body).user.id).toBe(4);
    expect(JSON.parse(response.body).user.name).toBe("David Vargas");
    done();
  });
});
