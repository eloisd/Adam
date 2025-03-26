import {Component, EventEmitter, inject, Output, Signal} from '@angular/core';
import {ChatBubbleComponent} from "./chat-bubble/chat-bubble.component";
import {ChatInputComponent} from './chat-input/chat-input.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ChatBubbleBotComponent} from './chat-bubble-bot/chat-bubble-bot.component';
import {MessagesStore} from '../../../core/stores/messages.store';
import {Message} from '../../../core/models/message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ChatBubbleComponent,
    ChatInputComponent,
    ReactiveFormsModule,
    ChatBubbleBotComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  host:{
    '[class.empty]': 'messages().length === 0'
  }
})
export class ChatComponent {
  @Output('scroll') scroll = new EventEmitter<Event>();
  readonly messagesStore = inject(MessagesStore);
  readonly messages: Signal<Message[]> = this.messagesStore.entities;

  onScroll(event: Event): void {
    this.scroll.emit(event);
  }

  onSendMessage(text: string): void {

  }

}
