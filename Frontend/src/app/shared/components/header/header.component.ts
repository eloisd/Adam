import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {environment} from '../../../../environments/environment';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {AuthStore} from '../../../core/stores/auth.store';
import {FilesStore} from '../../../core/stores/files.store';
import {FileModel} from '../../../core/models/file.model';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    MatTooltip,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() isSidenavOpen = false;
  @Output('openSidenav') openSidenav = new EventEmitter<void>();
  readonly authStore = inject(AuthStore);
  readonly filesStore = inject(FilesStore);
  files = this.filesStore.entities;

  img_url = `${environment.apiUrl}/avatar/generate?firstname=${this.authStore.user()?.firstname}&lastname=${this.authStore.user()?.lastname}`;

  download(file: FileModel) {
    this.filesStore.downloadFile(file);
  }
}
