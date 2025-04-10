import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { PaginationParams, QueryPagination } from '../../common/decorators/pagination.decorator';
import { AuthGuard } from '@nestjs/passport';
import { QuestionEntity } from '../../entities/question.entity';

@UseGuards(AuthGuard('jwt-access'))
@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {
  }

  @Get()
  async getQuestions(@Query('topic_id') topic_id: string, @QueryPagination() paginationParams: PaginationParams) {
    const [ items, total ] = await this.questionService.getQuestionsByTopicId(topic_id, paginationParams);

    return {
      items: items,
      total: total
    };
  }

  @Get(':id')
  getQuestion(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  @Delete(':id')
  deleteQuestion(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }

  @Post()
  async createQuestion(@Body() question: QuestionEntity) {
    return this.questionService.createQuestion(question);
  }
}
