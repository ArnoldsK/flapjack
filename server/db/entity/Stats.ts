import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export class StatsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  guildId!: string

  @Column()
  channelId!: string

  @Column()
  userId!: string

  @CreateDateColumn({
    type: "int",
    precision: 10,
    default: Math.floor(new Date().getTime() / 1000),
    transformer: {
      from: (value?: number) => {
        if (!value) return

        const date = new Date()

        date.setTime(value * 1000)

        return date
      },
      to: () => {
        return Math.floor(new Date().getTime() / 1000)
      },
    },
  })
  timestamp!: Date
}
