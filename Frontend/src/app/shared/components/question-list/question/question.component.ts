import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {Question} from '../../../../core/models/question.model';

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
  isSubmitted: boolean = false;
  isCorrect: boolean = false;

  selectAnswer(answerId: string): void {
    // Si déjà soumis, ne pas permettre de changer la réponse
    if (!this.isSubmitted) {
      this.selectedAnswerId = answerId;
      this.answerSelected.emit(answerId);
    }
  }

  onSubmit(): void {
    if (this.selectedAnswerId !== null) {
      this.isSubmitted = true;
      this.submit.emit(this.selectedAnswerId);

      // Vérifier si la réponse sélectionnée est correcte
      const selectedAnswer = this.question.answers.find(answer => answer.id === this.selectedAnswerId);
      if (selectedAnswer) {
        this.isCorrect = selectedAnswer.is_correct || false;
      }
    }
  }

  // Méthode pour vérifier si une réponse est correcte
  isAnswerCorrect(answerId: string): boolean {
    if (!this.isSubmitted) return false;

    const answer = this.question.answers.find(a => a.id === answerId);
    return answer?.is_correct || false;
  }

  // Méthode pour obtenir la classe CSS pour une réponse
  getAnswerClass(answerId: string): string {
    if (!this.isSubmitted) {
      return this.selectedAnswerId === answerId ? 'selected' : '';
    }

    if (answerId === this.selectedAnswerId) {
      return this.isAnswerCorrect(answerId) ? 'selected correct' : 'selected incorrect';
    }

    // Montrer également les autres réponses correctes
    return this.isAnswerCorrect(answerId) ? 'correct' : '';
  }
}
