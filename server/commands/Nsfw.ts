import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { CacheKey } from "../types/cache"
import { RedgifsModel } from "../models/Redgifs"
import { RedGifsGif } from "../types/redgifs"

export default class NsfwCommand extends BaseCommand {
  static version = 2

  static command = new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("Random NSFW")
    .setNSFW(true)

  async execute() {
    // Wait for the posts to be fetched
    await this.interaction.deferReply()

    // Get the next post
    const post = await this.#getPost()
    if (!post) {
      this.fail("Couldn't find a post")
      return
    }

    // Send the post
    this.editReply({
      files: [post.urls.sd],
    })
  }

  async #getPost(): Promise<RedGifsGif | null> {
    let posts = this.context.cache.get(CacheKey.NsfwPosts)

    if (!posts?.length) {
      posts = await this.#fetchPosts()
    }

    const [post] = posts.splice(0, 1)

    this.context.cache.set(CacheKey.NsfwPosts, posts)

    return post ?? null
  }

  async #fetchPosts(): Promise<RedGifsGif[]> {
    const model = new RedgifsModel()

    return await model.getGifs()
  }
}
