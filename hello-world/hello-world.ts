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

import { MemoryBotStorage } from "botbuilder";

let voxa;

try {
  /* tslint:disable-next-line:no-var-requires */
  voxa = require("voxa");
} catch (error) {
  /* tslint:disable-next-line:no-var-requires */
  voxa = require("../src");
}

const {
  AlexaPlatform,
  BotFrameworkPlatform,
  DialogFlowPlatform,
  IVoxaIntent,
  VoxaApp,
} = voxa;

/* tslint:disable-next-line:no-var-requires */
const views = require("./views.json");

const app = new VoxaApp({ views });
app.onIntent("input.welcome", {
  to: "LaunchIntent",
});

app.onIntent("LaunchIntent", {
  ask: "launch",
  flow: "yield",
  to: "likesVoxa?",
});

app.onState("likesVoxa?", (request: any) => {
  if (!request.intent) {
    throw new Error("Not an intent request");
  }

  if (request.intent.name === "YesIntent") {
    return { tell: "doesLikeVoxa" };
  }

  if (request.intent.name === "NoIntent") {
    return { ask: "doesNotLikeVoxa" };
  }
});

export const alexaSkill = new AlexaPlatform(app);

export const dialogFlowAction = new DialogFlowPlatform(app);

async function recognize(msg: any): Promise<any> {
  if (!msg.text) {
    return;
  }

  if (msg.text === "yes") {
    return {
      name: "YesIntent",
      params: {},
      rawIntent: {},
    };
  }

  if (msg.text === "no") {
    return {
      name: "NoIntent",
      params: {},
      rawIntent: {},
    };
  }

  throw new Error("Didn't recognize");
}

export const botFrameworkSkill = new BotFrameworkPlatform(app, {
  defaultLocale: "en",
  recognize,
  storage: new MemoryBotStorage(),
});

export const alexaLambdaHTTPHandler = alexaSkill.lambdaHTTP();
export const alexaLambdaHandler = alexaSkill.lambda();
export const dialogFlowActionLambdaHTTPHandler = dialogFlowAction.lambdaHTTP();
export const dialogFlowActionLambdaHandler = dialogFlowAction.lambda();
