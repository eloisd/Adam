import { Injectable } from "@nestjs/common";
import { ChatOpenAI } from "@langchain/openai";
import { ConfigService } from "@nestjs/config";

type ChatOpenAiModel =
  'gpt-4o-mini' |
  'gpt-4o' |
  'o3-mini' |
  'gpt-3.5-turbo';

@Injectable()
export class OpenAiService {
  constructor(private readonly configService: ConfigService) {}

  getChatModel(model: ChatOpenAiModel) {
    return new ChatOpenAI({
      openAIApiKey: this.configService.get<string>("OPENAI_API_KEY"),
      model: model,
      streaming: true,
    });
  }
}
