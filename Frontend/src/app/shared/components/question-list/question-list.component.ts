import {Component, inject, Signal} from '@angular/core';
import {McqQuestionComponent} from './mcq-question/mcq-question.component';
import {QuestionsStore} from '../../../core/stores/questions.store';
import {QuestionGateway} from '../../../core/ports/question.gateway';
import {Question} from '../../../core/models/question.model';
import {QaQuestionComponent} from './qa-question/qa-question.component';

@Component({
  selector: 'app-question-list',
  imports: [
    McqQuestionComponent,
    QaQuestionComponent
  ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss'
})
export class QuestionListComponent {
  readonly questionsStore = inject(QuestionsStore);
  readonly orderedEntities: Signal<Question[]> = this.questionsStore.orderedEntities;
}
