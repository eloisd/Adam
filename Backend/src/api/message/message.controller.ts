import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageEntity } from "../../entities/message.entity";

@Controller("messages")
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  getMessagesByTopicId(@Query() filters: Partial<MessageEntity>) {
    return this.messageService.findWithFilters(filters);
  }

  @Post()
  createMessage(@Body() message: MessageEntity) {
    return this.messageService.createMessage(message);
  }
}
