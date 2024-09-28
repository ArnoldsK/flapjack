import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class CommandExecuteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: string

  @Column()
  commandName: string

  @Column({ type: "text" })
  input: string

  @CreateDateColumn()
  createdAt: Date
}
