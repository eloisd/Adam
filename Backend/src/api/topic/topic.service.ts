import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TopicEntity } from "../../entities/topic.entity";
import { UserContextService } from '../../common/user-context/user-context.service';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly topicRepository: Repository<TopicEntity>,
    private readonly userContextService: UserContextService
  ) {}

  getTopics() {
    return this.topicRepository.find({
      where: { user_id: this.userContextService.getUserId() }
    });
  }

  updateTopic(id: number, updateTopicDto: UpdateTopicDto) {
    return this.topicRepository.update(id, updateTopicDto);
  }

  deleteTopic(id: number) {
    return this.topicRepository.delete(id);
  }
}
