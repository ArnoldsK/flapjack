import { Repository } from "typeorm"
import { db } from "../database"
import RedgifsEntity from "../entity/Redgifs"
import { d } from "../utils/date"
import { RedGifsResponse } from "../types/redgifs"

export class RedgifsModel {
  #repository: Repository<RedgifsEntity>

  constructor() {
    this.#repository = db.getRepository(RedgifsEntity)
  }

  async getToken(): Promise<string> {
    let token: string

    const [entity] = await this.#repository.find()

    if (!entity || this.#isExpired(entity.createdAt)) {
      // Delete expired
      if (entity) {
        await entity.remove()
      }

      // Get a new token
      token = await this.#getNewToken()

      // Create a new one
      await this.#repository
        .create({
          token,
        })
        .save()
    } else {
      token = entity.token
    }

    return token
  }

  #isExpired(createdAt: Date): boolean {
    return d(createdAt).add(1, "day").isBefore(d())
  }

  #url(path: string, auth = false) {
    return new URL(path, "https://api.redgifs.com")
  }

  async #getNewToken(): Promise<string> {
    const res = await fetch(this.#url("/v2/auth/temporary"))
    const data = await res.json()

    return data.token
  }

  async #getHeaders() {
    const token = await this.getToken()

    return {
      Authorization: `Bearer ${token}`,
    }
  }

  async getGifs() {
    const url = this.#url("/v2/feeds/trending/popular")
    url.searchParams.set("page", "1")
    url.searchParams.set("count", "50")

    const res = await fetch(url, {
      headers: await this.#getHeaders(),
    })
    const data = await res.json()

    if ("error" in data) {
      throw new Error(JSON.stringify(data.error))
    }

    return (data as RedGifsResponse).gifs
  }
}
