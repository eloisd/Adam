import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuestionEntity } from "../../entities/question.entity";
import { PaginationParams } from '../../common/decorators/pagination.decorator';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly topicRepository: Repository<QuestionEntity>,
  ) {}

  getQuestionsByTopicId(topic_id: string, paginationParams: PaginationParams) {
    return this.topicRepository.findAndCount({
      where: { topic_id: topic_id },
      skip: paginationParams.offset,
      take: paginationParams.limit,
      order: {
        [paginationParams.orderBy || 'id']: paginationParams.orderDirection || 'ASC'
      },
      relations: { answers: true }
    });
  }

  getQuestionById(id: string) {
    return this.topicRepository.findOne({
      where: { id: id },
      relations: { answers: true }
    });
  }

  createQuestion(question: QuestionEntity) {
    return this.topicRepository.save(question);
  }

  updateQuestion(id: string, question: Partial<QuestionEntity>) {
    return this.topicRepository.update(id, question);
  }

  deleteQuestion(id: string) {
    return this.topicRepository.delete(id);
  }
}
