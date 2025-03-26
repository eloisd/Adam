import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from '../../entities/message.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  async findWithFilters(filters: Partial<MessageEntity>) {
    const query = this.messageRepository.createQueryBuilder('message');

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query.andWhere(`message.${key} = :${key}`, { [key]: value });
      }
    });

    return query.getMany();
  }

  createMessage(message: MessageEntity) {
    return this.messageRepository.save(message);
  }
}
