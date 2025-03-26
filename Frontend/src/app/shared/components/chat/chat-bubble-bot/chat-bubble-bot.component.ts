import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MarkdownComponent} from "ngx-markdown";
import Prism from 'prismjs';

@Component({
  selector: 'app-chat-bubble-bot',
  standalone: true,
    imports: [
        MarkdownComponent
    ],
  templateUrl: './chat-bubble-bot.component.html',
  styleUrl: './chat-bubble-bot.component.scss'
})
export class ChatBubbleBotComponent {
  @ViewChild('markdownContainer', { static: false }) markdownContainer!: ElementRef;

  onMarkdownReady() {
    Prism.highlightAll();
  }
}
