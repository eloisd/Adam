import {Component, Input} from '@angular/core';
import {Message} from '../../../../core/models/message.model';
import {MarkdownDisplayComponent} from '../../markdown-display/markdown-display.component';

@Component({
  selector: 'app-chat-bubble-bot',
  standalone: true,
  imports: [
    MarkdownDisplayComponent
  ],
  templateUrl: './chat-bubble-bot.component.html',
  styleUrl: './chat-bubble-bot.component.scss'
})
export class ChatBubbleBotComponent {
  @Input() message!: Message;
}
