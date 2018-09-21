import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback as AWSLambdaCallback,
  Context as AWSLambdaContext,
} from "aws-lambda";
import {
  IBotStorage,
  IBotStorageContext,
  IBotStorageData,
  IChatConnectorAddress,
  IMessage,
} from "botbuilder";
import * as debug from "debug";
import { IDirectiveClass } from "../../directives";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaIntent } from "../../VoxaEvent";
import { VoxaPlatform } from "../VoxaPlatform";
import { BotFrameworkEvent } from "./BotFrameworkEvent";
import { BotFrameworkReply } from "./BotFrameworkReply";
import {
  AttachmentLayout,
  Attachments,
  AudioCard,
  HeroCard,
  SigninCard,
  SuggestedActions,
  Text,
  TextP,
} from "./directives";

const botframeworklog: debug.IDebugger = debug("voxa:botframework");

const CortanaRequests = [
  "conversationUpdate",
  "contactRelationUpdate",
  "message",
];

const toAddress = {
  channelId: "channelId",
  conversation: "conversation",
  from: "user",
  id: "id",
  recipient: "bot",
  serviceUrl: "serviceUrl",
};

export type IRecognize = (msg: IMessage) => Promise<IVoxaIntent | void>;
export interface IBotframeworkPlatformConfig {
  applicationId?: string;
  applicationPassword?: string;
  storage: IBotStorage;
  recognize: IRecognize;
  defaultLocale: string;
}

export class BotFrameworkPlatform extends VoxaPlatform {
  public recognize: IRecognize;
  public storage: IBotStorage;
  public applicationId?: string;
  public applicationPassword?: string;

  constructor(voxaApp: VoxaApp, config: IBotframeworkPlatformConfig) {
    super(voxaApp, config);

    this.storage = config.storage;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
    this.recognize = config.recognize;
  }

  // Botframework requires a lot more headers to work than
  // the other platforms
  public lambdaHTTP() {
    const ALLOWED_HEADERS = [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token",
      "X-Amz-User-Agent",
      "x-ms-client-session-id",
      "x-ms-client-request-id",
      "x-ms-effective-locale",
    ];

    return async (
      event: APIGatewayProxyEvent,
      context: AWSLambdaContext,
      callback: AWSLambdaCallback<APIGatewayProxyResult>,
    ) => {
      const response = {
        body: "{}",
        headers: {
          "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(","),
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        statusCode: 200,
      };

      if (event.httpMethod !== "POST") {
        return callback(null, response);
      }

      try {
        const body = JSON.parse(event.body || "");
        const result = await this.execute(body, context);
        response.body = JSON.stringify(result);

        return callback(null, response);
      } catch (error) {
        return callback(error);
      }
    };
  }

  public async execute(msg: any, context: any) {
    msg = prepIncomingMessage(msg);

    const stateData: IBotStorageData | undefined = await this.getStateData(msg);
    const intent = await this.recognize(msg);

    const event = new BotFrameworkEvent(
      msg,
      context,
      stateData,
      this.storage,
      intent,
    );

    event.applicationId = this.applicationId;
    event.applicationPassword = this.applicationPassword;

    if (!event.request.locale) {
      event.request.locale = this.config.defaultLocale;
    }

    const reply = (await this.app.execute(
      event,
      new BotFrameworkReply(event),
    )) as BotFrameworkReply;
    await reply.send(event);
    return {};
  }

  protected getDirectiveHandlers(): IDirectiveClass[] {
    return [
      HeroCard,
      SuggestedActions,
      AudioCard,
      SigninCard,
      Text,
      TextP,
      Attachments,
      AttachmentLayout,
    ];
  }

  protected getPlatformRequests() {
    return CortanaRequests;
  }

  protected async getStateData(event: IMessage): Promise<IBotStorageData> {
    if (!event.address.conversation) {
      throw new Error("Missing conversation address");
    }

    const conversationId = encodeURIComponent(event.address.conversation.id);
    const userId = event.address.bot.id;
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData: false,
      persistUserData: false,
      userId,
    };

    return new Promise((resolve, reject) => {
      this.storage.getData(context, (err: Error, result: IBotStorageData) => {
        if (err) {
          return reject(err);
        }

        botframeworklog("got stateData");
        botframeworklog(result, context);
        return resolve(result);
      });
    });
  }
}

export function moveFieldsTo(
  frm: any,
  to: any,
  fields: { [id: string]: string },
): void {
  if (frm && to) {
    for (const f in fields) {
      if (frm.hasOwnProperty(f)) {
        if (typeof to[f] === "function") {
          to[fields[f]](frm[f]);
        } else {
          to[fields[f]] = frm[f];
        }
        delete frm[f];
      }
    }
  }
}

export function prepIncomingMessage(msg: IMessage): IMessage {
  // Patch locale and channelData
  moveFieldsTo(msg, msg, {
    channelData: "sourceEvent",
    locale: "textLocale",
  });

  // Ensure basic fields are there
  msg.text = msg.text || "";
  msg.attachments = msg.attachments || [];
  msg.entities = msg.entities || [];

  // Break out address fields
  const address = {} as IChatConnectorAddress;
  moveFieldsTo(msg, address, toAddress as any);
  msg.address = address;
  msg.source = address.channelId;

  // Check for facebook quick replies
  if (
    msg.source === "facebook" &&
    msg.sourceEvent &&
    msg.sourceEvent.message &&
    msg.sourceEvent.message.quick_reply
  ) {
    msg.text = msg.sourceEvent.message.quick_reply.payload;
  }

  return msg;
}
