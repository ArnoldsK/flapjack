export type ApiStatsCommand = {
  name: string
  count: number
}

export interface ApiStats {
  commands: ApiStatsCommand[]
}
