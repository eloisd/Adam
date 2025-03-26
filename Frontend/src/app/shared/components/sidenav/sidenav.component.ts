import {Component, ElementRef, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import {MatListItem, MatNavList} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {TopicsStore} from '../../../core/stores/topics.store';
import {Topic} from '../../../core/models/topic.model';
import {FormsModule} from '@angular/forms';
import {TopicLinkComponent} from './topic-link/topic-link.component';

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
  readonly topicsStore = inject(TopicsStore);
  topics = this.topicsStore.entities;
}
