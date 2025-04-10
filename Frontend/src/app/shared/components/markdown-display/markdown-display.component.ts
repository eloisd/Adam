import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownComponent} from 'ngx-markdown';
import {HighlightService} from './highlight.service';

@Component({
  selector: 'app-markdown-display',
  template: `
    <markdown [data]="markdownContent" (ready)="onReady()"></markdown>
  `,
  imports: [
    MarkdownComponent
  ]
})
export class MarkdownDisplayComponent {
  @Input() markdownContent!: string;

  constructor(private highlightService: HighlightService, private elementRef: ElementRef) {
  }

  onReady() {
    const codeBlocks = this.elementRef.nativeElement.querySelectorAll('pre[class*="language-"] code');

    codeBlocks.forEach(async (block: Element) => {
      const className = block.className;
      const match = className.match(/language-(\w+)/);

      if (match && match[1]) {
        const language = match[1];
        await this.highlightService.highlightElement(block as HTMLElement, language);
      }
    });
  }
}
