import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('video_watches')
export class VideoWatch {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  user_id: number;

  @Column()
  video_id: number;

  @Column({ type: 'int', default: 0 })
  watch_time: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
} 