import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryColumn({ unique: true })
  public id: string;

  @Column({ unique: true }) // unique = can't be added twice
  public nickname: string;
}
