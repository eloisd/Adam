import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { MessageEntity } from "../entities/message.entity";
import { GraphService } from './main-agent/graph';

@UseGuards(AuthGuard("jwt-access"))
@Controller("chatbot")
export class ChatbotController {
  constructor(
    private chatbotService: ChatbotService,
  ) {}

  @Post()
  async chat(@Body() message: MessageEntity, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const webStream = await this.chatbotService.chat(message);
      const reader = webStream.getReader();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          res.write(`data: ${value}\n\n`);
        }

        res.end();
      };

      pump().catch((err) => {
        console.error("Erreur pendant le stream :", err);
        res.write(
          `data: ${JSON.stringify({ status: "error", message: err.message })}\n\n`,
        );
        res.end();
      });
    } catch (error) {
      console.error("Erreur d’appel chat :", error);
      res.write(
        `data: ${JSON.stringify({ status: "error", message: error.message })}\n\n`,
      );
      res.end();
    }
  }

  @Post('test')
  async testChat(@Body() message: MessageEntity) {
    return this.chatbotService.testChat(message);
  }
}
