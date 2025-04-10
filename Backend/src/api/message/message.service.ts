import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MessageEntity } from "../../entities/message.entity";
import { Repository } from "typeorm";
import { PaginationParams } from "../../common/decorators/pagination.decorator";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  getMessagesByTopicId(topic_id: string, paginationParams?: PaginationParams) {
    return this.messageRepository.findAndCount({
      where: { topic_id: topic_id },
      skip: paginationParams?.offset,
      take: paginationParams?.limit,
      order: {
        [paginationParams?.orderBy || "id"]:
          paginationParams?.orderDirection || "ASC",
      },
    });
  }

  getMessageById(id: string) {
    return this.messageRepository.findOne({
      where: { id: id },
    });
  }

  async createMessage(message: MessageEntity) {
    await this.messageRepository.save(message);
  }

  async updateMessage(id: string, message: Partial<MessageEntity>) {
    await this.messageRepository.update(id, message);
  }
}
