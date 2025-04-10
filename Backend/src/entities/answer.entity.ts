import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'answer' })
export class AnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  content: string;

  @Column({ type: 'boolean' })
  is_correct: boolean;

  @Column()
  question_id: string;

  @ManyToOne(() => QuestionEntity, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
