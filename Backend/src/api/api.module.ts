import { Module, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AnswerController } from "./answer/answer.controller";
import { AnswerService } from "./answer/answer.service";
import { FilesService } from "./file/files.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "../entities/file.entity";
import { AnswerEntity } from "../entities/answer.entity";
import { MessageEntity } from "../entities/message.entity";
import { QuestionEntity } from "../entities/question.entity";
import { TopicEntity } from "../entities/topic.entity";
import { UserEntity } from "../entities/user.entity";
import { FilesController } from "./file/files.controller";
import { MessageController } from "./message/message.controller";
import { QuestionController } from "./question/question.controller";
import { TopicController } from "./topic/topic.controller";
import { UserController } from "./user/user.controller";
import { MessageService } from "./message/message.service";
import { QuestionService } from "./question/question.service";
import { TopicService } from "./topic/topic.service";
import { UserService } from "./user/user.service";
import { CommonModule } from '../common/common.module';

@UseGuards(AuthGuard("jwt-access"))
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnswerEntity,
      FileEntity,
      MessageEntity,
      QuestionEntity,
      TopicEntity,
      UserEntity,
    ]),
    CommonModule
  ],
  controllers: [
    AnswerController,
    FilesController,
    MessageController,
    QuestionController,
    TopicController,
    UserController,
  ],
  providers: [
    AnswerService,
    FilesService,
    MessageService,
    QuestionService,
    TopicService,
    UserService,
  ],
  exports: [
    FilesService,
    MessageService,
    TopicService,
    UserService,
    QuestionService,
  ],
})
export class ApiModule {}
