import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { TopicService } from "./topic.service";
import { AuthGuard } from '@nestjs/passport';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@UseGuards(AuthGuard('jwt-access'))
@Controller("topics")
export class TopicController {
  constructor(private topicService: TopicService) {}

  @Get()
  getTopics() {
    return this.topicService.getTopics();
  }

  @Patch(':id')
  updateTopic(
    @Param('id') id: number,
    @Body() updateTopicDto: UpdateTopicDto
  ) {
    return this.topicService.updateTopic(id, updateTopicDto);
  }

  @Delete(':id')
  deleteTopic(@Param('id') id: number) {
    return this.topicService.deleteTopic(id);
  }
}
