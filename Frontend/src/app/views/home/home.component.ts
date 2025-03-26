import {Component, inject, OnInit} from '@angular/core';
import {SidenavComponent} from '../../shared/components/sidenav/sidenav.component';
import {
  MatDrawer,
  MatDrawerContainer, MatDrawerContent,
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent
} from '@angular/material/sidenav';
import {environment} from '../../../environments/environment';
import {HeaderComponent} from '../../shared/components/header/header.component';
import {ChatComponent} from '../../shared/components/chat/chat.component';
import {TopicsStore} from '../../core/stores/topics.store';
import {ActivatedRoute} from '@angular/router';
import {MessagesStore} from '../../core/stores/messages.store';
import {FilesStore} from '../../core/stores/files.store';

@Component({
  selector: 'app-home',
  imports: [
    MatSidenavContainer,
    MatSidenavContent,
    MatSidenav,
    SidenavComponent,
    HeaderComponent,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    ChatComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  readonly topicsStore = inject(TopicsStore);
  readonly messagesStore = inject(MessagesStore);
  readonly filesStore = inject(FilesStore);
  hasAppChatScrolled = false;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.topicsStore.fetchTopics();
    this.route.paramMap.subscribe((params) => {
      const topicId = params.get('topicid');
      if (topicId) {
        this.messagesStore.fetchMessages(+topicId);
        this.filesStore.fetchFiles(+topicId);
      } else {
        this.messagesStore.fetchMessages(NaN);
        this.filesStore.fetchFiles(NaN);
      }
    })
  }

  onScrollAppChat(event: Event) {
    this.hasAppChatScrolled = (event.target as HTMLElement).scrollTop !== 0;
  }


}
