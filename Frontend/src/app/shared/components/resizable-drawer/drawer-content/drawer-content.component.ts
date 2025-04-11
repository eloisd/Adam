import {Component, ElementRef, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BooleanInput} from '@angular/cdk/coercion';

@Component({
  selector: 'app-drawer-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
  host: {
    class: 'app-drawer-content',
  },
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    `,
  ],
})
export class DrawerContentComponent {
  constructor(private el: ElementRef<HTMLElement>) {}

  get width(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.width);
  }

  get minWidth(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.minWidth);
  }

  get maxWidth(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.maxWidth);
  }
}
