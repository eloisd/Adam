import {Component, Input} from '@angular/core';
import {MarkdownModule} from 'ngx-markdown';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [
    MarkdownModule
  ],
  templateUrl: './chat-bubble.component.html',
  styleUrl: './chat-bubble.component.scss',
})
export class ChatBubbleComponent {

}
