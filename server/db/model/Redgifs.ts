import { BaseModel } from "~/server/base/Model"
import { RedgifsEntity } from "~/server/db/entity/Redgifs"
import { d } from "~/server/utils/date"
import { RedGifsResponse } from "~/types/redgifs"

export class RedgifsModel extends BaseModel {
  async getToken(): Promise<string> {
    let token: string

    const [entity] = await this.em.findAll(RedgifsEntity, {
      limit: 1,
    })

    if (!entity || this.#isExpired(entity.createdAt)) {
      // Delete expired
      if (entity) {
        await this.em.removeAndFlush(entity)
      }

      // Get a new token
      token = await this.#getNewToken()

      // Save it
      await this.em.create(RedgifsEntity, { token })
      await this.em.persistAndFlush(RedgifsEntity)
    } else {
      token = entity.token
    }

    return token
  }

  #isExpired(createdAt: Date): boolean {
    return d(createdAt).add(1, "day").isBefore(d())
  }

  #url(path: string) {
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
