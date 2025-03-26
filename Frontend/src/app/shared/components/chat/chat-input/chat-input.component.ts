import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {AutoResize_elDirective} from './directives/auto-resize-textarea.directive';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    AutoResize_elDirective,
    MatFormField,
    MatInput,
    MatSuffix,
    MatIconButton,
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Output() sendMessage = new EventEmitter<string>();
  @ViewChild('chatInput') textarea: ElementRef<HTMLTextAreaElement> | undefined;

  onEnterPressed(event: Event): void {
    event.preventDefault();
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea.value.length < 1) return;
    this.sendMessage.emit(textarea.value);
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
  }

  onClick(event: Event): void {
    if (this.textarea) {
      if (this.textarea?.nativeElement.value.length < 1) return;
      this.sendMessage.emit(this.textarea.nativeElement.value);
      this.textarea.nativeElement.value = '';
      this.textarea.nativeElement.dispatchEvent(new Event('input'));
    }
  }
}
