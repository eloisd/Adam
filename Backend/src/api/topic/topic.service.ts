import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TopicEntity } from "../../entities/topic.entity";
import { UserContextService } from '../../common/user-context/user-context.service';
import { PaginationParams } from '../../common/decorators/pagination.decorator';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly topicRepository: Repository<TopicEntity>,
    private readonly userContextService: UserContextService
  ) {}

  getTopics(paginationParams: PaginationParams) {
    return this.topicRepository.findAndCount({
      where: { user_id: this.userContextService.getUserId() },
      skip: paginationParams.offset,
      take: paginationParams.limit,
      order: {
        [paginationParams.orderBy || 'id']: paginationParams.orderDirection || 'ASC'
      }
    });
  }

  createTopic(topic: TopicEntity) {
    return this.topicRepository.save({
      ...topic,
      user_id: this.userContextService.getUserId()
    });
  }

  updateTopic(id: string, topic: Partial<TopicEntity>) {
    return this.topicRepository.update(id, topic);
  }

  deleteTopic(id: string) {
    return this.topicRepository.delete(id);
  }
}
