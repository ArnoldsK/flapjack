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

export interface OsrsItemStats {
  meleeAttack: number
  magicAttack: number
  rangedAttack: number
  meleeDefence: number
  magicDefence: number
  rangedDefence: number
  meleeStrength: number
  rangedStrength: number
  magicStrength: number
  speed: number | null
}

export interface OsrsItemData extends Omit<OsrsItemStats, "speed"> {
  id: number
  name: string
  slot: ItemSlot
  weaponVariant: ItemWeaponVariant | null
}

export interface OsrsPriceData {
  items: Array<[number, number]>
}
