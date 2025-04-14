import {Component, inject, OnInit, Signal} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FilesStore} from '../../../../core/stores/files.store';
import {FileModel} from '../../../../core/models/file.model';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-file-management-modal',
  imports: [
    MatIcon,
    MatLabel,
    MatError,
    MatDialogTitle,
    MatTooltip,
    NgIf,
    MatDialogContent,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDialogActions,
    MatButton,
    NgClass,
    MatOption,
    MatSelect,
    NgForOf,
  ],
  templateUrl: './file-management-modal.component.html',
  styleUrl: './file-management-modal.component.scss'
})
export class FileManagementModalComponent {
  readonly filesStore = inject(FilesStore);
  readonly file: Signal<FileModel | null> = this.filesStore.selectedEntity;
  isLoading = false;
  isEditing = false;
  fileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    document_type: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  })

  documentTypes: string[] = [
    'Cours',
    'Encyclopédie',
    'Article scientifique',
    'Documentation technique',
    'Livre',
    'Autre'
  ];

  constructor(
    private dialogRef: MatDialogRef<FileManagementModalComponent>,
  ) {
    toObservable(this.filesStore.selectedEntity).subscribe({
      next: (file) => {
        this.fileForm.setValue({
          name: file?.name || '',
          document_type: file?.document_type || '',
          description: file?.description || ''
        });
      }
    })
  }

  saveChanges(): void {
    if (this.fileForm.valid) {
      const updatedFile = {
        ...this.file(),
        name: this.fileForm.get('name')?.value
      };
      this.dialogRef.close({ action: 'update', file: updatedFile });
    }
  }

  deleteFile(): void {
    this.filesStore.deleteFile(this.file()!!.id).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (err) => {
        console.error('Error deleting file:', err);
      }
    })
  }

  startRag(): void {
    this.isLoading = true;
    this.filesStore.processRag(this.file()!!.id).subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        console.error('Error processing file for RAG:', err);
        this.isLoading = false;
      }
    })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
