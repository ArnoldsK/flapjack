import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class ToxicScoreBatchEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  body: string

  @Column()
  sent: 0 | 1

  @Column({ type: "varchar", nullable: true })
  remoteBatchId: string | null

  @CreateDateColumn()
  createdAt: Date
}
