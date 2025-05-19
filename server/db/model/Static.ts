import { Repository } from "typeorm"

import { db } from "~/server/database"
import { StaticDataEntity } from "~/server/db/entity/StaticData"
import { StaticData, StaticDataType } from "~/types/entity"

export class StaticModel<Type extends StaticDataType> {
  #dataType: Type
  #repository: Repository<StaticDataEntity<Type>>

  constructor(dataType: Type) {
    this.#dataType = dataType
    this.#repository = db.getRepository(StaticDataEntity<Type>)
  }

  async get() {
    const entity = await this.#repository.findOne({
      where: { type: this.#dataType },
    })

    return entity?.value ?? null
  }

  async set(value: StaticData[Type]) {
    const hasEntity = Boolean(
      await this.#repository.count({
        where: { type: this.#dataType },
      }),
    )

    if (hasEntity) {
      await this.#repository.update(
        { type: this.#dataType },
        {
          // HACK: TypeORM typing isn't the smartest
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: value as any,
        },
      )
    } else {
      await this.#repository
        .create({
          type: this.#dataType,
          value,
        })
        .save()
    }
  }
}
