import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, AfterInsert, CreateDateColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';

@Entity({ name: 'file' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  document_type: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column()
  is_ragged: boolean;

  @Column()
  size: number;

  @Column({ type: 'varchar', length: 255 })
  mimetype: string;

  @Column({ type: 'varchar', length: 10 })
  ext: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column()
  topic_id: string

  @ManyToOne(() => TopicEntity, (topic) => topic.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;
}
