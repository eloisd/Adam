import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MessageService } from "./message.service";
import { PaginationParams } from "../../common/decorators/pagination.decorator";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt-access"))
@Controller("messages")
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  async getMessagesByTopicId(
    @Query("topic_id") topic_id: string,
    @Query() paginationParams: PaginationParams,
  ) {
    const [items, total] = await this.messageService.getMessagesByTopicId(
      topic_id,
      paginationParams,
    );

    return {
      items: items,
      total: total,
    };
  }
}
