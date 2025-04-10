import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject, OnDestroy,
  Output, signal,
  Signal, ViewChild
} from '@angular/core';
import {ChatBubbleComponent} from "./chat-bubble/chat-bubble.component";
import {ChatInputComponent} from './chat-input/chat-input.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ChatBubbleBotComponent} from './chat-bubble-bot/chat-bubble-bot.component';
import {MessagesStore} from '../../../core/stores/messages.store';
import {Message} from '../../../core/models/message.model';
import {SIGNAL} from '@angular/core/primitives/signals';
import {Subscription} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';

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
    '[class.empty]': 'messages().length === 0',
    '[class.small]': 'isSmall()',
  }
})
export class ChatComponent implements AfterViewInit, OnDestroy {
  @Output('scroll') scroll = new EventEmitter<Event>();
  @ViewChild('chatWrapper') chatWrapperRef!: ElementRef;
  @ViewChild('chatList') chatListRef!: ElementRef;
  readonly messagesStore = inject(MessagesStore);
  readonly messages: Signal<Message[]> = this.messagesStore.orderedEntities;
  readonly isSmall = signal(false);
  isUserScrolling: boolean = false;  // Pour savoir si l'utilisateur a scrollé
  isAtBottom: boolean = true;  // Pour savoir si l'utilisateur est déjà en bas
  observerList: ResizeObserver[] = [];
  subscription: Subscription;

  constructor(private elementRef: ElementRef) {
    this.subscription = toObservable(this.messagesStore.selectedTopic).subscribe({
      next: () => {
        this.isUserScrolling = false;
        this.isAtBottom = true;
      }
    })
  }

  ngAfterViewInit() {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.isSmall.set(entry.contentRect.width < 785);
      }
    });

    observer.observe(this.elementRef.nativeElement);

    this.observeResizeList();
  }

  ngOnDestroy() {
    this.observerList.forEach((observer) => observer.disconnect())
  }

  onScroll(event: Event): void {
    this.scroll.emit(event);

    const container = this.chatWrapperRef.nativeElement;
    const atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

    if (atBottom) {
      this.isAtBottom = true;
      this.isUserScrolling = false;
    } else {
      this.isAtBottom = false;
      this.isUserScrolling = true;
    }

    this.loadMoreMessages();
  }

  loadMoreMessages(): void {
    if (this.messagesStore.isPending() || !this.messagesStore.hasMore()) return;

    const container = this.chatWrapperRef.nativeElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Calculer le pourcentage de défilement par rapport au haut
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage <= 25) {
      this.messagesStore.continueFetchMessages(this.messagesStore.selectedTopic()!!?.id);
    }
  }

  onSendMessage(text: string): void {
    this.isUserScrolling = false;
    this.messagesStore.sendMessage(text);
  }

  // Observe les changements de taille du conteneur wrapper
  private observeResizeHost(): void {
    const container = this.elementRef.nativeElement;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.isSmall.set(entry.contentRect.width < 785);
      }
    });
    this.observerList.push(resizeObserver);

    resizeObserver.observe(container);
  }

  // Observe les changements de taille du conteneur list
  private observeResizeList(): void {
    const container = this.chatListRef.nativeElement;

    const resizeObserver = new ResizeObserver(() => {
      if (!this.isUserScrolling) {
        this.scrollToBottom();
      }
    });
    this.observerList.push(resizeObserver);

    resizeObserver.observe(container);
  }

  // Effectue un scroll vers le bas si l'utilisateur n'a pas scrollé manuellement
  private scrollToBottom(): void {
    const container = this.chatWrapperRef.nativeElement;
    if (this.isAtBottom || !this.isUserScrolling) {
      container.scrollTop = container.scrollHeight;
    }
  }

}
