import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class RedgifsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ type: "text" })
  token: string

  @CreateDateColumn()
  createdAt: Date
}
