import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid') //unique identifier
  public id: string;

  @Column({ unique: true }) // unique = can't be added twice
  public nickname: string;
}
