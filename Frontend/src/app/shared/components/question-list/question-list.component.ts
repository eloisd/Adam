import {Component, inject, Signal} from '@angular/core';
import {QuestionComponent} from './question/question.component';
import {QuestionsStore} from '../../../core/stores/questions.store';
import {QuestionGateway} from '../../../core/ports/question.gateway';
import {Question} from '../../../core/models/question.model';

@Component({
  selector: 'app-question-list',
  imports: [
    QuestionComponent
  ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss'
})
export class QuestionListComponent {
  readonly questionsStore = inject(QuestionsStore);
  readonly orderedEntities: Signal<Question[]> = this.questionsStore.orderedEntities;
}
