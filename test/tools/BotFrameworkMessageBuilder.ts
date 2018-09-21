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

import * as _ from "lodash";
import { v1 } from "uuid";

export class BotFrameworkMessageBuilder {
  public data: any = {
    channelId: "cortana",
    serviceUrl: "https://CortanaBFChannelEastUs.azurewebsites.net/",
    type: "message",
  };

  constructor(conversationId: string) {
    this.data.conversation = {
      id: conversationId,
    };
  }

  public from(id: string): BotFrameworkMessageBuilder {
    this.data.from = {
      id,
    };

    return this;
  }

  public serviceUrl(url: string): BotFrameworkMessageBuilder {
    this.data.serviceUrl = url;
    return this;
  }

  public recipient(id: string): BotFrameworkMessageBuilder {
    this.data.recipient = {
      id,
    };

    return this;
  }

  public locale(localeName: string): BotFrameworkMessageBuilder {
    this.data.locale = localeName;
    return this;
  }

  public entity(entityObject: any): BotFrameworkMessageBuilder {
    this.data.entities = this.data.entities || [];
    this.data.entities.push(entityObject);

    return this;
  }

  public clearEntities(): BotFrameworkMessageBuilder {
    this.data.entities = [];

    return this;
  }

  public toMessage(): any {
    this.data.id = v1();
    return _.cloneDeep(this.data);
  }

  public text(t: string): BotFrameworkMessageBuilder {
    this.data.text = t;
    return this;
  }
}
