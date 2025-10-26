export enum GearSlot {
  Head = "head",
  Cape = "cape",
  Neck = "neck",
  OneHanded = "oneHanded",
  TwoHanded = "twoHanded",
  Body = "body",
  Shield = "shield",
  Legs = "legs",
  Hands = "hands",
  Feet = "feet",
  Ring = "ring",
}

export interface OsrsPriceData {
  items: Array<[number, number]>
}
