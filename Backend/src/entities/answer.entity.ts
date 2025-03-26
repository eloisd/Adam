import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'answer' })
export class AnswerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  answer: string;

  @Column({ type: 'boolean' })
  correct: boolean;

  @Column()
  question_id: number;

  @ManyToOne(() => QuestionEntity, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
