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

  @Column({ unique: true })
  userId: string

  @Column()
  toxicCount: number

  @Column()
  totalCount: number

  @Column()
  toxicInARow: number

  @CreateDateColumn()
  createdAt: Date
}
