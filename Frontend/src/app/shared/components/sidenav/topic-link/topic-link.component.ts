import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {MatListItem} from "@angular/material/list";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {Topic} from '../../../../core/models/topic.model';
import {TopicsStore} from '../../../../core/stores/topics.store';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {FilesStore} from '../../../../core/stores/files.store';
import {UploadModalComponent} from './upload-modal/upload-modal.component';

@Component({
  selector: 'app-topic-link',
  imports: [
    MatIcon,
    MatListItem,
    ReactiveFormsModule,
    RouterLinkActive,
    MatMenu,
    MatMenuItem,
    RouterLink,
    MatMenuTrigger,
    FormsModule
  ],
  templateUrl: './topic-link.component.html',
  styleUrl: './topic-link.component.scss'
})
export class TopicLinkComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;
  @Input() topic!: Topic;
  readonly topicsStore = inject(TopicsStore);
  editingTopic = false;
  editedName = '';

  constructor(private matDialog: MatDialog, private router: Router) {
  }

  ngOnInit() {
    if (this.topic && this.topic.name === '') {
      this.startTopicEdition();
    }
  }

  saveTopicName(topic: Topic) {
    if (this.editedName === '' && this.topic.name === '') {
      this.topicsStore.removeTopic(this.topic.id);
      return;
    }
    if (this.topic.name === '') {
      topic.name = this.editedName;
      this.topicsStore.createTopic(this.topic).subscribe()
    }
    if (topic.name != this.editedName) {
      topic.name = this.editedName;
      this.topicsStore.updateTopic(topic.id, topic).subscribe();
    }
    this.editingTopic = false;
  }

  startTopicEdition() {
    this.editedName = this.topic?.name || '';
    this.editingTopic = true;
    setTimeout(() => this.editInput.nativeElement.focus());
  }

  showUploadModal() {
    const dialogRef = this.matDialog.open(UploadModalComponent, {
      width: '60%',
      panelClass: ['custom-modal', 'custom-modal-big'],
      data: { topicName: this.topic.name }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          // this.uploadFiles();
        }
      }
    });
  }

  showDeleteTopic() {
    const dialogRef = this.matDialog.open(DeleteModalComponent, {
      width: '400px',
      height: '200px',
      panelClass: 'custom-modal',
      data: { topicName: this.topic.name }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.deleteTopic()
        }
      }
    });
  }

  deleteTopic() {
    this.topicsStore.deleteTopic(this.topic.id).subscribe();
    if (this.router.url === `/topic/${this.topic.id}`) {
      this.router.navigate(['/']);
    }
  }
}
