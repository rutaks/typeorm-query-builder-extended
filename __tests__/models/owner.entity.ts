import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../types/gender.type';

@Entity({ name: 'owners' })
export class Owner {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  names?: string;

  @Column('text', { nullable: true })
  gender?: Gender;

  @Column({ nullable: true })
  dob?: Date;

  @Column({ default: false })
  isDeleted: boolean = false;
}
