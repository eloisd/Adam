import {Component, inject, OnInit} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton, MatIconButton} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatInput} from '@angular/material/input';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FileTypeToClassCssPipe} from './file-type-to-class-css.pipe';
import {FilesStore} from '../../../../../core/stores/files.store';
import {FileModel} from '../../../../../core/models/file.model';

interface FileItem {
  file: File;
  formGroup: FormGroup;
}

@Component({
  selector: 'app-upload-modal',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatLabel,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatFormField,
    MatSelect,
    MatCardSubtitle,
    MatCardTitle,
    ReactiveFormsModule,
    MatOption,
    NgIf,
    NgForOf,
    NgClass,
    MatInput,
    MatIconButton,
    FileTypeToClassCssPipe
  ],
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.scss'
})
export class UploadModalComponent implements OnInit {
  files: FileItem[] = [];
  dragAreaClass: string = 'dragarea';
  isInvalidFile: boolean = false;
  readonly filesStore = inject(FilesStore);

  documentTypes: string[] = [
    'Cours',
    'Encyclopédie',
    'Article scientifique',
    'Documentation technique',
    'Livre',
    'Autre'
  ];

  acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/json'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UploadModalComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragAreaClass = 'dragarea dragarea-hover';

    // Vérifier les types de fichiers pendant le drag
    if (event.dataTransfer && event.dataTransfer.items) {
      let hasInvalidFile = false;

      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === 'file') {
          const fileType = item.type;
          if (!this.isFileTypeAccepted(fileType)) {
            hasInvalidFile = true;
            break;
          }
        }
      }

      this.isInvalidFile = hasInvalidFile;
      if (hasInvalidFile) {
        this.dragAreaClass = 'dragarea dragarea-invalid';
      }
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragAreaClass = 'dragarea';
    this.isInvalidFile = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragAreaClass = 'dragarea';
    this.isInvalidFile = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(files);
    }
  }

  private processFiles(fileList: FileList): void {
    let invalidCount = 0;
    let validCount = 0;

    Array.from(fileList).forEach(file => {
      if (this.isFileTypeAccepted(file.type)) {
        const fileItem: FileItem = {
          file: file,
          formGroup: this.fb.group({
            document_type: ['', Validators.required],
            title: ['', Validators.required]
          })
        };

        this.files.push(fileItem);
        validCount++;
      } else {
        invalidCount++;
      }
    });

    // Notification pour informer l'utilisateur
    if (invalidCount > 0) {
      this.snackBar.open(
        `${invalidCount} fichier(s) rejeté(s) : type non accepté. Formats acceptés : PDF, Word, TXT, JSON`,
        'Fermer',
        { duration: 5000, panelClass: 'error-snackbar' }
      );
    }

    if (validCount > 0) {
      this.snackBar.open(
        `${validCount} fichier(s) ajouté(s) avec succès`,
        'Fermer',
        { duration: 3000 }
      );
    }
  }

  private isFileTypeAccepted(fileType: string): boolean {
    return this.acceptedFileTypes.includes(fileType);
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  uploadFiles(): void {
    // Vérifier que tous les formulaires sont valides
    const allFormsValid = this.files.every(fileItem => fileItem.formGroup.valid);

    if (allFormsValid) {
      const files = this.files.map(fileItem => fileItem.file);
      const filesModel = this.files.map(fileItem =>
        new FileModel(
          fileItem.file,
          fileItem.formGroup.value.document_type,
          fileItem.formGroup.value.title,
          this.filesStore.selectedTopic()!!.id
        )
      );

      this.filesStore.uploadFiles(this.filesStore.selectedTopic()!!.id, files, filesModel).subscribe({
        next: () => {
          this.snackBar.open('Fichiers téléchargés avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close();
        },
        error: () => {
          this.snackBar.open('Erreur lors du téléchargement des fichiers', 'Fermer', { duration: 5000, panelClass: 'error-snackbar' });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.files.forEach(fileItem => {
        if (!fileItem.formGroup.valid) {
          Object.keys(fileItem.formGroup.controls).forEach(key => {
            fileItem.formGroup.get(key)?.markAsTouched();
          });
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
