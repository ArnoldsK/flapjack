import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export class CommandExecuteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: string

  @Column()
  channelId: string

  @Column()
  commandName: string

  @Column({ type: "text" })
  input: string

  @CreateDateColumn()
  createdAt: Date
}
