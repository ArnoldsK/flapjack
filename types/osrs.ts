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
  itemSlot: ItemSlot
  weaponVariant: ItemWeaponVariant | null
  itemId: number
  itemName: string
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

export interface OsrsPriceData {
  items: Array<[number, number]>
}
