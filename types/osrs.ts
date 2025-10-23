export enum OsrsItemSlot {
  Body = "body",
  Cape = "cape",
  Feet = "feet",
  Legs = "legs",
  Neck = "neck",
  Shield = "shield",
  OneHanded = "oneHanded",
  TwoHanded = "twoHanded",
}

export interface OsrsPriceItem {
  id: number
  price: number
}

export interface OsrsPriceData {
  items: OsrsPriceItem[]
}
