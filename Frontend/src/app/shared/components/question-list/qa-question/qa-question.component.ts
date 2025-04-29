import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Question} from '../../../../core/models/question.model';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-qa-question',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './qa-question.component.html',
  styleUrl: './qa-question.component.scss'
})
export class QaQuestionComponent {
  @Input() question!: Question;
  @Input() showSubmitButton: boolean = true;

  @Output() answerSubmitted = new EventEmitter<string>();
  @Output() submit = new EventEmitter<string>();

  userAnswer: string = '';
  isSubmitted: boolean = false;
  showCorrectAnswer: boolean = false;

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.userAnswer = input.value;
    this.answerSubmitted.emit(this.userAnswer);
  }

  onSubmit(): void {
    if (this.userAnswer.trim() !== '') {
      this.isSubmitted = true;
      this.showCorrectAnswer = true;
      this.submit.emit(this.userAnswer);
    }
  }

  checkAnswer(): boolean {
    // TODO
    // Implémentez la logique de vérification de la réponse ici
    return true;
  }

  // Réinitialiser le composant pour essayer à nouveau
  resetAnswer(): void {
    this.isSubmitted = false;
    this.showCorrectAnswer = false;
  }
}
