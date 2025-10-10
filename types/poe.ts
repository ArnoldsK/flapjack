export interface PoeScarab {
  name: string
  chaosValue: number
  icon: string
}

export interface PoeScarabData {
  league: string
  scarabs: PoeScarab[]
}
