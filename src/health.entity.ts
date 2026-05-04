 import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;
}
