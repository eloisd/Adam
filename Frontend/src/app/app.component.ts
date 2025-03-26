import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {IconService} from './shared/services/icon.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend';

  constructor(private iconService: IconService) {
    this.iconService.registerIcons(['new-topic', 'open-sidenav', 'search-sidenav', 'document']);
    this.iconService.setDefaultFontSetClass('material-symbols-outlined');
  }
}
