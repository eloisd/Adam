import { Module } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatbotController } from "./chatbot.controller";
import { MessageModule } from "../api/message/message.module";

@Module({
  imports: [MessageModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
