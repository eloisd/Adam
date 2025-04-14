import {Component, inject, OnInit, Signal} from '@angular/core';
import {SidenavComponent} from '../../shared/components/sidenav/sidenav.component';
import {
  MatDrawer, MatDrawerContainer,
  MatDrawerContent,
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent
} from '@angular/material/sidenav';
import {HeaderComponent} from '../../shared/components/header/header.component';
import {ChatComponent} from '../../shared/components/chat/chat.component';
import {TopicsStore} from '../../core/stores/topics.store';
import {ActivatedRoute} from '@angular/router';
import {QuestionListComponent} from '../../shared/components/question-list/question-list.component';
import {QuestionsStore} from '../../core/stores/questions.store';
import {ResizableDrawerComponent} from '../../shared/components/resizable-drawer/resizable-drawer.component';
import {DrawerComponent} from '../../shared/components/resizable-drawer/drawer/drawer.component';
import {DrawerContentComponent} from '../../shared/components/resizable-drawer/drawer-content/drawer-content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenavContent,
    MatSidenav,
    SidenavComponent,
    HeaderComponent,
    ChatComponent,
    QuestionListComponent,
    ResizableDrawerComponent,
    DrawerComponent,
    DrawerContentComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  readonly topicsStore = inject(TopicsStore);
  readonly questionsStore = inject(QuestionsStore);
  readonly questionsSize: Signal<number> = this.questionsStore.size;
  hasAppChatScrolled = false;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.topicsStore.fetchTopics();
    this.route.paramMap.subscribe((params) => {
      const topicId = params.get('topicid');
      this.topicsStore.selectEntity(topicId);
    })

    this.topicsStore.entityMap
  }

  onScrollAppChat(event: Event) {
    this.hasAppChatScrolled = (event.target as HTMLElement).scrollTop !== 0;
  }


}
