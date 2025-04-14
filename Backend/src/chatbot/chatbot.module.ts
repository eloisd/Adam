import { Module } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatbotController } from "./chatbot.controller";
import { ApiModule } from "../api/api.module";
import { PromptService } from "./prompt/prompt.service";
import { ChromaDbService } from "./vector-store/chromadb/chromadb.service";
import { OpenAiService } from "./llm/openai/openai.service";
import { RagService } from './rag/rag.service';
import { RagController } from './rag/rag.controller';
import { SplitterChunksService } from './rag/splitter-chunks/splitter-chunks.service';
import { GoogleGenaiService } from './llm/google-genai/google-genai.service';
import { AboutChatbotService } from './main-agent/about_chatbot';
import { GraphService } from './main-agent/graph';
import { McqService } from './main-agent/mcq';
import { QaService } from './main-agent/qa';
import { RagSService } from './main-agent/rag';
import { ToolsManagerService } from './main-agent/tools_manager';

@Module({
  imports: [ApiModule],
  providers: [
    ChatbotService,
    PromptService,
    ChromaDbService,
    OpenAiService,
    RagService,
    SplitterChunksService,
    GoogleGenaiService,
    AboutChatbotService,
    GraphService,
    McqService,
    QaService,
    RagSService,
    ToolsManagerService
  ],
  controllers: [ChatbotController, RagController],
})
export class ChatbotModule {}
