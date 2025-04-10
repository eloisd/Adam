import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TopicService } from "./topic.service";
import { AuthGuard } from '@nestjs/passport';
import { PaginationParams, QueryPagination } from '../../common/decorators/pagination.decorator';
import { TopicEntity } from '../../entities/topic.entity';

@UseGuards(AuthGuard('jwt-access'))
@Controller("topics")
export class TopicController {
  constructor(private topicService: TopicService) {}

  @Get()
  async getTopics(@QueryPagination() query: PaginationParams) {
    const [ items, total ] = await this.topicService.getTopics(query);

    return {
      items: items,
      total: total
    };
  }

  @Post()
  createTopic(@Body() topic: TopicEntity) {
    return this.topicService.createTopic(topic);
  }

  @Patch(':id')
  updateTopic(
    @Param('id') id: string,
    @Body() topic: Partial<TopicEntity>
  ) {
    return this.topicService.updateTopic(id, topic);
  }

  @Delete(':id')
  deleteTopic(@Param('id') id: string) {
    return this.topicService.deleteTopic(id);
  }
}
