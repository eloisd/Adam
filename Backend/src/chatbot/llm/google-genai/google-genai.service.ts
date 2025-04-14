import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

type ChatGoogleGenaiModel =
  'models/gemini-2.0-flash' |
  'models/gemini-2.0-flash-lite' |
  'models/gemini-1.5-flash' |
  'models/gemini-1.5-flash-8b' |
  'models/gemini-1.5-pro';

@Injectable()
export class GoogleGenaiService {
  constructor(private readonly configService: ConfigService) {}

  getChatModel(model: ChatGoogleGenaiModel) {
    return new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY'),
      model: model
    });
  }
}
