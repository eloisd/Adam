import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private iconPath = 'assets/icons/';

  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

  registerIcons(icons: string[]): void {
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${this.iconPath}${icon}.svg`)
      );
    });
  }

  setDefaultFontSetClass(className: string): void {
    this.iconRegistry.setDefaultFontSetClass(className);
  }
}
