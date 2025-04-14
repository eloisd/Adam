import {Provider} from '@angular/core';
import {AuthGateway} from '../ports/auth.gateway';
import {ApiAuthGateway} from './api/api-auth.gateway';
import {UsersGateway} from '../ports/users.gateway';
import {ApiUsersGateway} from './api/api-users.gateway';
import {TopicsGateway} from '../ports/topics.gateway';
import {ApiTopicsGateway} from './api/api-topics.gateway';
import {MessagesGateway} from '../ports/messages.gateway';
import {ApiMessagesGateway} from './api/api-messages.gateway';
import {FilesGateway} from '../ports/files.gateway';
import {ApiFilesGateway} from './api/api-files.gateway';
import {QuestionGateway} from '../ports/question.gateway';
import {ApiQuestionGateway} from './api/api-question.gateway';
import {ChatbotGateway} from '../ports/chatbot.gateway';
import {ApiChatbotGateway} from './api/api-chatbot.gateway';
import {RagGateway} from '../ports/rag.gateway';
import {ApiRagGateway} from './api/api-rag.gateway';

export function provideGateways(): Provider[] {
  return [
    { provide: AuthGateway, useFactory: () => new ApiAuthGateway() },
    { provide: UsersGateway, useFactory: () => new ApiUsersGateway() },
    { provide: TopicsGateway, useFactory: () => new ApiTopicsGateway() },
    { provide: MessagesGateway, useFactory: () => new ApiMessagesGateway() },
    { provide: FilesGateway, useFactory: () => new ApiFilesGateway() },
    { provide: QuestionGateway, useFactory: () => new ApiQuestionGateway() },
    { provide: ChatbotGateway, useFactory: () => new ApiChatbotGateway() },
    { provide: RagGateway, useFactory: () => new ApiRagGateway() },
  ]
}
