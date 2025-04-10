import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { TopicEntity } from './topic.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 45 })
  firstname: string;

  @Column({ length: 45 })
  lastname: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, unique: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => TopicEntity, (topic) => topic.user, { cascade: true })
  topics: TopicEntity[];
}
