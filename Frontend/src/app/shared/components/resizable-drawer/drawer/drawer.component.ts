import {Component, ElementRef, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BooleanInput} from '@angular/cdk/coercion';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
  `,
  host: {
    class: 'app-drawer',
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
export class DrawerComponent {
  @Input({ transform: (value: any) => value === '' || value === 'true' || value === true})
  opened: BooleanInput;

  constructor(private el: ElementRef<HTMLElement>) {}

  get minWidth(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.minWidth) || null;
  }

  get maxWidth(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.maxWidth) || null;
  }

  get width(): number | null {
    if (!this.el.nativeElement) return null;
    const style = window.getComputedStyle(this.el.nativeElement);
    return parseFloat(style.width) || null;
  }

  close() {
    this.opened = false;
  }

  open() {
    this.opened = true;
  }

  toggle() {
    this.opened = !this.opened;
  }
}
