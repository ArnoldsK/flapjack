import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { discordIds } from "../config"
import { CacheKey, CacheNsfwPost } from "../types/cache"

export default class NsfwCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("Randomly found NSFW media")
    .setNSFW(true)

  async execute() {
    const isNsfwChannel = this.channel.id === discordIds.channels.nsfw

    const post = await this.#getPost()

    if (!post) {
      this.fail("Couldn't find a post")
      return
    }

    this.reply({
      ephemeral: !isNsfwChannel,
      content: post.title,
      files: [post.mediaUrl],
    })
  }

  async #getPost(): Promise<CacheNsfwPost | null> {
    let posts = this.context.cache.get(CacheKey.NsfwPosts)

    if (!posts.length) {
      posts = await this.#fetchPosts()
    }

    const [post] = posts.splice(0, 1)

    this.context.cache.set(CacheKey.NsfwPosts, posts)

    return post ?? null
  }

  async #fetchPosts(): Promise<CacheNsfwPost[]> {
    const res = await fetch("https://api.scrolller.com/api/v2/graphql", {
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain;charset=UTF-8",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        query: /* graphql */ `
            query DiscoverFilteredSubredditsQuery(
              $filter: MediaFilter
              $limit: Int
              $iterator: String
              $hostsDown: [HostDisk]
              $includeFilters: [Int]
              $excludeFilters: [Int]
            ) {
              discoverFilteredSubreddits(
                isNsfw: true
                filter: $filter
                limit: $limit
                iterator: $iterator
                includeFilters: $includeFilters
                excludeFilters: $excludeFilters
              ) {
                items {
                  __typename
                  children(
                    limit: 1
                    iterator: null
                    filter: null
                    disabledHosts: $hostsDown
                  ) {
                    items {
                      __typename
                      id
                      url
                      title
                      redditPath
                      mediaSources {
                        url
                        width
                        height
                      }
                    }
                  }
                }
              }
            }
          `,
        variables: {
          limit: 30,
          filter: null,
          hostsDown: null,
          includeFilters: [2],
          excludeFilters: [],
        },
        authorization: null,
      }),
      method: "POST",
    })
    const result = await res.json()

    const sections = result.data.discoverFilteredSubreddits.items
    const posts = sections.flatMap((el: any) => {
      const item = el.children.items[0]

      return {
        title: item.title,
        url: `https://reddit.com/${item.redditPath}`,
        mediaUrl: item.mediaSources[item.mediaSources.length - 1].url,
      }
    })

    return posts
  }
}
