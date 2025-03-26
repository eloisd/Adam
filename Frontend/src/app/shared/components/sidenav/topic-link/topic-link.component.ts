import {Component, ElementRef, inject, Input, ViewChild} from '@angular/core';
import {MatListItem} from "@angular/material/list";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Topic} from '../../../../core/models/topic.model';
import {TopicsStore} from '../../../../core/stores/topics.store';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {DeleteModalComponent} from './delete-modal/delete-modal.component';
import {FilesStore} from '../../../../core/stores/files.store';

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
export class TopicLinkComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;
  @Input() topic!: Topic;
  readonly topicsStore = inject(TopicsStore);
  readonly filesStore = inject(FilesStore);
  editingTopic = false;
  editedName = '';
  selectedFiles: File[] = [];

  constructor(private matDialog: MatDialog) {
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    this.selectedFiles = [];
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      for (const file of fileList) {
        this.selectedFiles.push(file);
      }
      this.uploadFiles();
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    this.filesStore.uploadFile({
      topic_id: this.topic.id,
      files: this.selectedFiles
    });
  }

  saveTopicName(topic: Topic) {
    if (topic.name != this.editedName) {
      topic.name = this.editedName;
      this.topicsStore.updateTopic(topic);
    }
    this.editingTopic = false;
  }

  startTopicEdition() {
    this.editedName = this.topic?.name || '';
    this.editingTopic = true;
    setTimeout(() => this.editInput.nativeElement.focus());
  }

  deleteTopic() {
    const dialogRef = this.matDialog.open(DeleteModalComponent, {
      width: '400px',
      height: '200px',
      panelClass: 'custom-modal',
      data: { topicName: this.topic.name }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.topicsStore.deleteTopic(this.topic.id);
        }
      }
    });
  }
}
