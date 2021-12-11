import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pets' })
export class Pet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  names?: string;

  @Column()
  type?: string;

  @Column()
  breed?: string;
}
