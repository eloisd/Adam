import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Question} from '../../../../core/models/question.model';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-question',
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent {
  @Input() question!: Question;
  @Input() showSubmitButton: boolean = true;

  @Output() answerSelected = new EventEmitter<string>();
  @Output() submit = new EventEmitter<string>();

  selectedAnswerId: string | null = null;

  selectAnswer(answerId: string): void {
    this.selectedAnswerId = answerId;
    this.answerSelected.emit(answerId);
  }

  onSubmit(): void {
    if (this.selectedAnswerId !== null) {
      this.submit.emit(this.selectedAnswerId);
    }
  }
}
