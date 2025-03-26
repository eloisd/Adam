import { Module } from "@nestjs/common";
import { TopicController } from "./topic.controller";
import { TopicService } from "./topic.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TopicEntity } from "../../entities/topic.entity";
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TopicEntity]),
    CommonModule
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
