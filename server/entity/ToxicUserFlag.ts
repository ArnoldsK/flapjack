import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class ToxicUserFlagEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  userId: string

  @Column({ type: "tinyint" })
  isToxic: boolean

  @Column({ type: "text" })
  reason: string

  @CreateDateColumn()
  createdAt: Date
}
