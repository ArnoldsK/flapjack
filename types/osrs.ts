export enum ItemSlot {
  Head = "head",
  Cape = "cape",
  Neck = "neck",
  Weapon = "weapon",
  Body = "body",
  Shield = "shield",
  Legs = "legs",
  Hands = "hands",
  Feet = "feet",
  Ring = "ring",
}

export enum ItemWeaponVariant {
  OneHanded = "oneHanded",
  TwoHanded = "twoHanded",
}

export interface OsrsItemData {
  id: number
  name: string
  slot: ItemSlot
  weaponVariant: ItemWeaponVariant | null
}

export interface OsrsPriceData {
  items: Array<[number, number]>
}
