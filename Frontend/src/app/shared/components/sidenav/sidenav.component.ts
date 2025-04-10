import {Component, EventEmitter, inject, Output, QueryList, Signal, ViewChildren} from '@angular/core';
import {MatListItem, MatNavList} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {TopicsStore} from '../../../core/stores/topics.store';
import {FormsModule} from '@angular/forms';
import {TopicLinkComponent} from './topic-link/topic-link.component';
import {AuthStore} from '../../../core/stores/auth.store';
import {TopicGroup} from '../../services/group-topics.service';
import {Topic} from '../../../core/models/topic.model';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatNavList,
    MatListItem,
    RouterLink,
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatTooltip,
    FormsModule,
    TopicLinkComponent
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  @Output('close') close = new EventEmitter<void>();
  @ViewChildren(TopicLinkComponent) topicComponents!: QueryList<TopicLinkComponent>;
  readonly topicsStore = inject(TopicsStore);
  readonly authStore = inject(AuthStore);
  groupedEntities: Signal<TopicGroup[]> = this.topicsStore.groupedEntities;

  createNewTopic() {
    this.topicsStore.addTopic(new Topic('', this.authStore.user()!!.id));
  }
}
