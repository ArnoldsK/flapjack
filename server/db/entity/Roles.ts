import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class RolesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  userId!: string

  @Column({
    type: "text",
    transformer: {
      from: (value?: string) => {
        if (!value) return

        return value.split(",")
      },
      to: (value: string[]) => {
        return value.join(",")
      },
    },
  })
  roleIds!: string[]
}
