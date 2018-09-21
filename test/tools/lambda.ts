/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  APIGatewayProxyEvent,
  Callback as AWSLambdaCallback,
  Context as AWSLambdaContext,
} from "aws-lambda";
import * as _ from "lodash";

export function getLambdaContext(
  callback: AWSLambdaCallback<any>,
): AWSLambdaContext {
  return {
    awsRequestId: "aws://",
    callbackWaitsForEmptyEventLoop: false,
    functionName: "functionName",
    functionVersion: "0.1",
    invokedFunctionArn: "arn://",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: 128,

    getRemainingTimeInMillis: () => 1000,

    done: callback,
    fail: (err: Error | string) => {
      if (_.isString(err)) {
        return callback(new Error(err));
      }

      return callback(err);
    },
    succeed: (msg: any) => callback(undefined, msg),
  };
}

export function getAPIGatewayProxyEvent(
  method: string = "GET",
  body: string | null = null,
): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    httpMethod: method,
    isBase64Encoded: false,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {
      accountId: "",
      apiId: "",
      httpMethod: method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        sourceIp: "",
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: "/",
      requestId: "",
      requestTimeEpoch: 123,
      resourceId: "",
      resourcePath: "/",
      stage: "",
    },
    resource: "",
    stageVariables: null,
  };
}
