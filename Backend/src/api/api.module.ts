import { Module } from '@nestjs/common';
import { AnswerModule } from './answer/answer.module';
import { FilesModule } from './file/files.module';
import { MessageModule } from './message/message.module';
import { QuestionModule } from './question/question.module';
import { TopicModule } from './topic/topic.module';
import { UserModule } from './user/user.module';
import { RouterModule } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Module({
  imports: [
    AnswerModule,
    FilesModule,
    MessageModule,
    QuestionModule,
    TopicModule,
    UserModule
  ],
})
export class ApiModule {}
