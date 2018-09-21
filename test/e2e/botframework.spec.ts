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

import { IMessage } from "botbuilder";
import { expect } from "chai";
import * as _ from "lodash";
import * as portfinder from "portfinder";
import * as simple from "simple-mock";
import { BotFrameworkReply } from "../../src";
import { BotFrameworkMessageBuilder } from "../tools";

import { botFrameworkSkill } from "../../hello-world/hello-world";

/* tslint:disable-next-line:no-var-requires */
const views = require("../../hello-world/views.json");

describe("Hello World Botframework", () => {
  let builder: BotFrameworkMessageBuilder;
  beforeEach(() => {
    simple.mock(BotFrameworkReply.prototype, "botApiRequest").resolveWith({});

    builder = new BotFrameworkMessageBuilder(
      "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
    )
      .from("B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722")
      .recipient("test");
  });

  afterEach(() => {
    simple.restore();
  });

  it("Runs the botframework skill and like's voxa", async () => {
    builder.entity({
      name: "Microsoft.Launch",
      type: "Intent",
    });

    await botFrameworkSkill.execute(builder.toMessage(), {});
    let reply = getLastReply();

    expect(reply.speak).to.include(views.en.translation.launch);

    builder.clearEntities().text("yes");

    await botFrameworkSkill.execute(builder.toMessage(), {});
    reply = getLastReply();
    expect(reply.speak).to.include(views.en.translation.doesLikeVoxa);
  });

  it("Runs the alexa skill and does not like voxa", async () => {
    builder.entity({
      name: "Microsoft.Launch",
      type: "Intent",
    });

    await botFrameworkSkill.execute(builder.toMessage(), {});
    let reply = getLastReply();

    expect(reply.speak).to.include(views.en.translation.launch);

    builder.clearEntities().text("no");

    await botFrameworkSkill.execute(builder.toMessage(), {});
    reply = getLastReply();
    expect(reply.speak).to.include(views.en.translation.doesNotLikeVoxa);
  });
});

function getLastReply(): IMessage {
  return _.get(BotFrameworkReply.prototype, "botApiRequest.lastCall.args[2]");
}
