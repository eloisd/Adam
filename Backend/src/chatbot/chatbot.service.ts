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
import { GraphService } from './main-agent/graph';
import { QuestionEntity } from "../entities/question.entity";
import { AnswerEntity } from "../entities/answer.entity";
import { QuestionService } from "../api/question/question.service";

@Injectable()
export class ChatbotService {
  private chatModel: ChatOpenAI;

  constructor(
    private messageService: MessageService,
    private questionService: QuestionService,
    private configService: ConfigService,
    private graphService: GraphService,
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

  async testChat(message: MessageEntity) {
    await this.messageService.createMessage(message);

    const state = await this.graphService.processQuery(message.content, message.topic_id);

    const createdMessage = new MessageEntity();
    let createdQuestionList = [new QuestionEntity(), new QuestionEntity(), new QuestionEntity()]

    createdMessage.topic_id = message.topic_id;
    if (state['messages_'][state['messages_'].length - 2] instanceof AIMessage) {
      const parseJson = JSON.parse(state['messages_'][state['messages_'].length - 2].content);
      console.log(parseJson);
      const isQCM = !!parseJson["1"]['mcq'];
      for (let i = 1; i <= 3; i++) {
        createdQuestionList[i - 1].id = crypto.randomUUID();
        createdQuestionList[i - 1].topic_id = message.topic_id;
        createdQuestionList[i - 1].isQCM = isQCM;
        createdQuestionList[i - 1].content = parseJson[`${i}`]['mcq'] || parseJson[`${i}`]['question'];
        createdQuestionList[i - 1].answers = [];
        const correctAnswer = parseJson[`${i}`]['correct'];
        if (isQCM) {
          for (const value of ["a", "b", "c", "d"]) {
            const answer = new AnswerEntity();
            answer.id = crypto.randomUUID();
            answer.question_id = createdQuestionList[i - 1].id;
            answer.content = parseJson[`${i}`]['options'][value];
            answer.is_correct = value === correctAnswer;
            createdQuestionList[i - 1].answers.push(answer);
          }
        } else {
          const answer = new AnswerEntity();
          answer.id = crypto.randomUUID();
          answer.question_id = createdQuestionList[i - 1].id;
          answer.content = parseJson[`${i}`]['correct'];
          answer.is_correct = true;
          createdQuestionList[i - 1].answers.push(answer);
        }

        this.questionService.createQuestion(createdQuestionList[i - 1]);
      }
    } else {
      createdQuestionList = [];
    }
    createdMessage.content = state['messages_'][state['messages_'].length - 1].content;
    createdMessage.author = "assistant";
    createdMessage.created_at = new Date();
    createdMessage.status = "finished_successfully";
    createdMessage.id = crypto.randomUUID();

    await this.messageService.createMessage(createdMessage)

    return { message: createdMessage, questions: createdQuestionList };
  }
}
