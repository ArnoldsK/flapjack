module.exports = {
  images: {
    domains: ["cdn.discordapp.com", "cdn.pepsidog.lv"],
  },
  compiler: {
    styledComponents: true,
  },
  /** @see https://stackoverflow.com/a/68098547/3893356 */
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  },
}
