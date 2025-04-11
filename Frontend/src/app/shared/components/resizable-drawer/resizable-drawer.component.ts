import {Component, ContentChild, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {NgClass} from '@angular/common';
import {DrawerContentComponent} from './drawer-content/drawer-content.component';
import {DrawerComponent} from './drawer/drawer.component';

@Component({
  selector: 'app-resizable-drawer',
  imports: [
    NgClass
  ],
  templateUrl: './resizable-drawer.component.html',
  styleUrl: './resizable-drawer.component.scss'
})
export class ResizableDrawerComponent implements OnDestroy {
  @ContentChild(DrawerContentComponent) drawerContent!: DrawerContentComponent;
  @ContentChild(DrawerComponent) drawer!: DrawerComponent;

  drawerWidth = 400;
  minDrawerWidth = 0;
  minDrawerContentWidth = 0;
  isResizing = false;
  startX = 0;
  startWidth = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.drawer.width ?? this.drawerWidth;
    event.preventDefault();

    // Capture des événements au niveau du document pour permettre le redimensionnement
    // même lorsque la souris quitte la zone de la poignée
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResizing);
  }

  resize = (event: MouseEvent) => {
    if (!this.isResizing) return;

    const offsetX = event.clientX - this.startX;
    const newWidth = this.startWidth + offsetX;

    const minDrawerWidth = this.drawer.minWidth ?? this.minDrawerWidth;
    const maxDrawerWidth = this.el.nativeElement.clientWidth - (this.drawerContent.minWidth ?? this.minDrawerContentWidth);

    // Appliquer les contraintes de taille
    if (newWidth >= minDrawerWidth && newWidth <= maxDrawerWidth) {
      this.drawerWidth = newWidth;
    }
  }

  stopResizing = () => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResizing);
  }

  ngOnDestroy(): void {
    // Nettoyage des écouteurs d'événements
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResizing);
  }
}
