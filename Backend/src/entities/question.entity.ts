import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';
import { AnswerEntity } from './answer.entity';

@Entity({ name: 'question' })
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean' })
  isQCM: boolean;

  @Column()
  topic_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => TopicEntity, (topic) => topic.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;

  @OneToMany(() => AnswerEntity, (answer) => answer.question, { cascade: true })
  answers: AnswerEntity[];
}
