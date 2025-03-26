import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, AfterInsert } from 'typeorm';
import { TopicEntity } from './topic.entity';

@Entity({ name: 'file' })
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column()
  size: number;

  @Column({ type: 'varchar', length: 255 })
  mimetype: string;

  @Column({ type: 'varchar', length: 10 })
  ext: string;

  @Column()
  topic_id: number

  @AfterInsert()
  async updateUrl() {
    this.url = `http://localhost:3000/api/files/download?id=${this.id}`;
  }

  @ManyToOne(() => TopicEntity, (topic) => topic.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: TopicEntity;
}
