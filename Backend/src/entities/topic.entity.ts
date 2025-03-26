import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { FileEntity } from './file.entity';
import { MessageEntity } from './message.entity';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'topic' })
export class TopicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45 })
  name: string;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, (user) => user.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => FileEntity, (document) => document.topic, { cascade: true })
  files: FileEntity[];

  @OneToMany(() => MessageEntity, (message) => message.topic, { cascade: true })
  messages: MessageEntity[];

  @OneToMany(() => QuestionEntity, (question) => question.topic, { cascade: true })
  questions: QuestionEntity[];
}
