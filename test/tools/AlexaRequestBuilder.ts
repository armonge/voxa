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
  Context,
  interfaces,
  RequestEnvelope,
  Session,
  SessionEndedReason,
} from "ask-sdk-model";
import * as _ from "lodash";
import { v1 } from "uuid";

import { AlexaEvent } from "../../src";

export class AlexaRequestBuilder {
  public version = "1.0";
  public applicationId: string;
  public deviceId: string;
  public userId: string;

  constructor(userId?: string, applicationId?: string) {
    this.userId = userId || `amzn1.ask.account.${v1()}`;
    this.applicationId = applicationId || `amzn1.ask.skill.${v1()}`;
    this.deviceId = applicationId || `amzn1.ask.device.${v1()}`;
  }

  public getSessionEndedRequest(
    reason: SessionEndedReason = "ERROR",
    error?: any,
  ): RequestEnvelope {
    return {
      context: this.getContextData(),
      request: {
        error,
        locale: "en-US",
        reason,
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "SessionEndedRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getDisplayElementSelectedRequest(token: string): RequestEnvelope {
    return {
      context: this.getContextData(),
      request: {
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        token,
        type: "Display.ElementSelected",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getCanFulfillIntentRequestRequest(
    intentName: string,
    slots?: any,
  ): RequestEnvelope {
    if (!slots) {
      slots = {};
    } else {
      slots = _(slots)
        .keys()
        .map((key) => [key, { name: key, value: slots[key] }])
        .fromPairs()
        .value();
    }

    return {
      context: this.getContextData(),
      request: {
        intent: { name: intentName, slots, confirmationStatus: "NONE" },
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "CanFulfillIntentRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getIntentRequest(intentName: string, slots?: any): RequestEnvelope {
    if (!slots) {
      slots = {};
    } else {
      slots = _(slots)
        .keys()
        .map((key) => [key, { name: key, value: slots[key] }])
        .fromPairs()
        .value();
    }

    return {
      context: this.getContextData(),
      request: {
        dialogState: "STARTED",
        intent: { name: intentName, slots, confirmationStatus: "NONE" },
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "IntentRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getContextData(): Context {
    return {
      AudioPlayer: {
        playerActivity: "IDLE",
      },
      System: {
        apiAccessToken: v1(),
        apiEndpoint: "https://api.amazonalexa.com",
        application: { applicationId: this.applicationId },
        device: {
          deviceId: this.deviceId,
          supportedInterfaces: {
            AudioPlayer: {},
            Display: {},
          },
        },
        user: {
          permissions: {
            consentToken: v1(),
          },
          userId: this.userId,
        },
      },
    };
  }
  public getSessionData(newSession: boolean = true): Session {
    return {
      // randomized for every session and set before calling the handler
      application: { applicationId: this.applicationId },
      attributes: {},
      new: newSession,
      sessionId: `SessionId.${v1()}`,
      user: {
        permissions: {
          consentToken: "",
        },
        userId: this.userId,
      },
    };
  }

  public getLaunchRequest(): RequestEnvelope {
    return {
      context: this.getContextData(),
      request: {
        locale: "en-US",
        requestId: "EdwRequestId." + v1(),
        timestamp: new Date().toISOString(),
        type: "LaunchRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getPlaybackStoppedRequest(token?: string): RequestEnvelope {
    const request: interfaces.audioplayer.PlaybackStoppedRequest = {
      locale: "en-US",
      requestId: "EdwRequestId." + v1(),
      timestamp: new Date().toISOString(),
      token,
      type: "AudioPlayer.PlaybackStopped",
    };

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getGameEngineInputHandlerEventRequest(
    buttonsRecognized: number = 1,
  ): RequestEnvelope {
    const request: interfaces.gameEngine.InputHandlerEventRequest = {
      events: [],
      locale: "en-US",
      requestId: `amzn1.echo-api.request.${v1()}`,
      timestamp: new Date().toISOString(),
      type: "GameEngine.InputHandlerEvent",
    };

    const eventArray: any[] = [];
    eventArray.push({
      inputEvents: [],
      name: "sample_event",
    });

    let id = 1;

    _.times(buttonsRecognized, () => {
      const event: any = {
        action: "down",
        color: "000000",
        feature: "press",
        gadgetId: `id${id}`,
        timestamp: "timestamp",
      };

      id += 1;

      eventArray[0].inputEvents.push(event);
    });

    request.events = eventArray;

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(false),
      version: this.version,
    };
  }

  public getConnectionsResponseRequest(
    name: string,
    token: string,
    payload: any,
    status?: interfaces.connections.ConnectionsStatus,
  ): RequestEnvelope {
    status = status || { code: "200", message: "OK" };

    const request: interfaces.connections.ConnectionsResponse = {
      locale: "en-US",
      name,
      payload,
      requestId: `EdwRequestId.${v1()}`,
      status,
      timestamp: new Date().toISOString(),
      token,
      type: "Connections.Response",
    };

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(false),
      version: this.version,
    };
  }
}

export function isAlexaEvent(voxaEvent: any): voxaEvent is AlexaEvent {
  return voxaEvent.alexa !== undefined;
}
