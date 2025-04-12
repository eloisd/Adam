import { Module } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatbotController } from "./chatbot.controller";
import { ApiModule } from "../api/api.module";
import { PromptService } from "./prompt/prompt.service";
import { ChromaDbService } from "./vector-store/chromadb/chromadb.service";
import { OpenaiService } from "./llm/openai/openai.service";
import { RagService } from './rag/rag.service';
import { RagController } from './rag/rag.controller';

@Module({
  imports: [ApiModule],
  providers: [ChatbotService, PromptService, ChromaDbService, OpenaiService, RagService],
  controllers: [ChatbotController, RagController],
})
export class ChatbotModule {}
