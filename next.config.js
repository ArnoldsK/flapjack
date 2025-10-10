module.exports = {
  images: {
    domains: ["cdn.discordapp.com", "cdn.pepsidog.lv", "web.poecdn.com"],
  },
  compiler: {
    styledComponents: true,
  },
  /** @see https://stackoverflow.com/a/68098547/3893356 */
  webpack: (config) => {
    // Disable fs module in the browser
    config.resolve.fallback = { fs: false }

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: {
          loader: "@svgr/webpack",
          options: { icon: true },
        },
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
}
