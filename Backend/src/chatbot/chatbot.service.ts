import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { MessageService } from "../api/message/message.service";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { MessageEntity } from "../entities/message.entity";
import { ConfigService } from "@nestjs/config";
import * as crypto from "node:crypto";

@Injectable()
export class ChatbotService {
  private chatModel: ChatOpenAI;

  constructor(
    private messageService: MessageService,
    private configService: ConfigService,
  ) {
    // Initialisez le modèle de langage
    this.chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>("OPENAI_API_KEY"),
      model: "gpt-4o-mini",
      streaming: true,
    });
  }

  // Convertir les messages de la BDD en format LangChain
  private convertToLangChainMessages(messages: MessageEntity[]): BaseMessage[] {
    return messages.map((msg) => {
      if (msg.author === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }

  // Charger l'historique d'un topic depuis la BDD
  private async loadTopicHistory(topic_id: string): Promise<BaseMessage[]> {
    const MAX_MESSAGES = 5;

    const [items] = await this.messageService.getMessagesByTopicId(topic_id, {
      offset: 0,
      limit: MAX_MESSAGES,
      orderBy: "created_at",
      orderDirection: "DESC",
    });

    return this.convertToLangChainMessages(items);
  }

  async chat(message: MessageEntity) {
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Créer et sauvegarder le message utilisateur dans la BDD
    await this.messageService.createMessage(message);

    // Charger l'historique de la conversation
    const history = await this.loadTopicHistory(message.topic_id);

    // Préparer le prompt
    const prompt: BaseMessage[] = [
      new SystemMessage(
        "Vous êtes un assistant utile et amical qui répond dans le contexte de cette conversation et vous repondrez uniquement en markdown",
      ),
      ...history,
      new HumanMessage(message.content),
    ];

    const messageService = this.messageService;

    const botMessage = new MessageEntity();
    botMessage.id = crypto.randomUUID();
    botMessage.topic_id = message.topic_id;
    botMessage.content = "";
    botMessage.author = "assistant";
    botMessage.created_at = new Date();
    botMessage.status = "in_progress";

    // Variables pour suivre l’état précédent
    let lastP: string | null = null;
    let lastO: string | null = null;

    // Fonction utilitaire pour envoyer un patch
    const sendPatch = async (p: string, o: string, v: any) => {
      let patch: any = {};
      if (p !== lastP) {
        patch.p = p;
        lastP = p;
      }
      if (o !== lastO) {
        patch.o = o;
        lastO = o;
      }
      patch.v = v;

      await writer.write(JSON.stringify(patch));
    };

    let tokenBuffer = "";
    let tokenCount = 0;

    // Appeler le modèle
    const promise = this.chatModel.invoke(prompt, {
      callbacks: [
        {
          async handleLLMStart() {
            await writer.ready;
            await sendPatch("", "add", { message: botMessage });
          },

          async handleLLMNewToken(token: string) {
            tokenBuffer += token;
            tokenCount++;

            if (tokenCount >= 10) {
              await sendPatch("content", "append", tokenBuffer);
              botMessage.content += tokenBuffer;
              tokenBuffer = "";
              tokenCount = 0;
            }
          },

          async handleLLMEnd() {
            await writer.ready;
            if (tokenBuffer) {
              await sendPatch("content", "append", tokenBuffer);
              botMessage.content += tokenBuffer;
            }

            await sendPatch("status", "replace", "finished_successfully");
            botMessage.status = "finished_successfully";

            await writer.close();
            await messageService.createMessage(botMessage);
          },

          async handleLLMError(err: any) {
            await writer.abort(err);
          },
        },
      ],
    });

    promise.catch((err) => {
      writer.abort(err);
    });

    return stream.readable;
  }
}
