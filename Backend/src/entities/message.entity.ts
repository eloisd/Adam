import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';

@Entity({ name: 'message' })
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author: string;

  @Column()
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column()
  topic_id: string;

  @ManyToOne(() => TopicEntity, (topic) => topic.messages, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;
}
