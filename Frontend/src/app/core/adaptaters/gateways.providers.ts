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

export function provideGateways(): Provider[] {
  return [
    { provide: AuthGateway, useFactory: () => new ApiAuthGateway() },
    { provide: UsersGateway, useFactory: () => new ApiUsersGateway() },
    { provide: TopicsGateway, useFactory: () => new ApiTopicsGateway() },
    { provide: MessagesGateway, useFactory: () => new ApiMessagesGateway() },
    { provide: FilesGateway, useFactory: () => new ApiFilesGateway() },
  ]
}
