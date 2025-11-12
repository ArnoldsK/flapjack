// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ScarabMapping {
  export interface Group {
    name: string
    wide?: boolean
    scarabs: string[]
  }

  export interface Column {
    groups: Group[]
  }

  export interface Row {
    gap: number
    /**
     * In the game, the last row is scuffed.
     * Horned scarabs are shifted by 0.66 of scarab width to the right.
     */
    scuffed?: boolean
    columns: Column[]
  }

  export interface Root {
    rows: Row[]
  }
}

export const mapping: ScarabMapping.Root = {
  rows: [
    {
      gap: 30,
      columns: [
        {
          groups: [
            {
              name: "Titanic",
              scarabs: [
                "Titanic Scarab",
                "Titanic Scarab of Treasures",
                "Titanic Scarab of Legend",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Sulphite",
              scarabs: [
                "Sulphite Scarab",
                "Sulphite Scarab of Fumes",
                "Sulphite Scarab of Greed",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Divination",
              scarabs: [
                "Divination Scarab of The Cloister",
                "Divination Scarab of Plenty",
                "Divination Scarab of Pilfering",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 30,
      columns: [
        {
          groups: [
            {
              name: "Anarchy",
              scarabs: [
                "Anarchy Scarab",
                "Anarchy Scarab of Gigantification",
                "Anarchy Scarab of Partnership",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Ritual",
              scarabs: [
                "Ritual Scarab of Selectiveness",
                "Ritual Scarab of Wisps",
                "Ritual Scarab of Abundance",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Harvest",
              scarabs: [
                "Harvest Scarab",
                "Harvest Scarab of Doubling",
                "Harvest Scarab of Cornucopia",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Kalguuran",
              scarabs: [
                "Kalguuran Scarab",
                "Kalguuran Scarab of Guarded Riches",
                "Kalguuran Scarab of Refinement",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 40,
      columns: [
        {
          groups: [
            {
              name: "Bestiary",
              scarabs: [
                "Bestiary Scarab",
                "Bestiary Scarab of the Herd",
                "Bestiary Scarab of Duplicating",
                "Bestiary Scarab of the Shadowed Crow",
              ],
            },
            {
              name: "Incursion",
              scarabs: [
                "Incursion Scarab",
                "Incursion Scarab of Invasion",
                "Incursion Scarab of Champions",
                "Incursion Scarab of Timelines",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Influencing",
              scarabs: [
                "Influencing Scarab of the Shaper",
                "Influencing Scarab of the Elder",
                "Influencing Scarab of Hordes",
                "Influencing Scarab of Conversion",
              ],
            },
            {
              name: "Betrayal",
              scarabs: [
                "Betrayal Scarab",
                "Betrayal Scarab of the Allflame",
                "Betrayal Scarab of Reinforcements",
                "Betrayal Scarab of Perpetuation",
              ],
            },
            {
              name: "Torment",
              scarabs: [
                "Torment Scarab",
                "Torment Scarab of Peculiarity",
                "Torment Scarab of Possession",
                "Torment Scarab of Release",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Harbinger",
              scarabs: [
                "Harbinger Scarab",
                "Harbinger Scarab of Obelisks",
                "Harbinger Scarab of Regency",
                "Harbinger Scarab of Warhoards",
              ],
            },
            {
              name: "Domination",
              scarabs: [
                "Domination Scarab",
                "Domination Scarab of Apparitions",
                "Domination Scarab of Evolution",
                "Domination Scarab of Terrors",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 54,
      columns: [
        {
          groups: [
            {
              name: "Cartography",
              scarabs: [
                "Cartography Scarab of Escalation",
                "Cartography Scarab of Risk",
                "Cartography Scarab of Corruption",
                "Cartography Scarab of the Multitude",
                "Cartography Scarab of Singularity",
              ],
            },
            {
              name: "Ambush",
              scarabs: [
                "Ambush Scarab",
                "Ambush Scarab of Hidden Compartments",
                "Ambush Scarab of Potency",
                "Ambush Scarab of Containment",
                "Ambush Scarab of Discernment",
              ],
            },
            {
              name: "Expedition",
              scarabs: [
                "Expedition Scarab",
                "Expedition Scarab of Runefinding",
                "Expedition Scarab of Verisium Powder",
                "Expedition Scarab of Archaeology",
                "Expedition Scarab of the Skald",
              ],
            },
            {
              name: "Legion",
              scarabs: [
                "Legion Scarab",
                "Legion Scarab of Officers",
                "Legion Scarab of Command",
                "Legion Scarab of Eternal Conflict",
                "Legion Scarab of The Sekhema",
              ],
            },
            {
              name: "Abyss",
              scarabs: [
                "Abyss Scarab",
                "Abyss Scarab of Multitudes",
                "Abyss Scarab of Edifice",
                "Abyss Scarab of Profound Depth",
                "Abyss Scarab of Emptiness",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Beyond",
              scarabs: [
                "Beyond Scarab",
                "Beyond Scarab of Haemophilia",
                "Beyond Scarab of Resurgence",
                "Beyond Scarab of the Invasion",
                "Beyond Scarab of Corruption",
              ],
            },
            {
              name: "Ultimatum",
              scarabs: [
                "Ultimatum Scarab",
                "Ultimatum Scarab of Bribing",
                "Ultimatum Scarab of Dueling",
                "Ultimatum Scarab of Catalysing",
                "Ultimatum Scarab of Inscription",
              ],
            },
            {
              name: "Delirium",
              scarabs: [
                "Delirium Scarab",
                "Delirium Scarab of Mania",
                "Delirium Scarab of Paranoia",
                "Delirium Scarab of Neuroses",
                "Delirium Scarab of Delusions",
              ],
            },
            {
              name: "Blight",
              scarabs: [
                "Blight Scarab",
                "Blight Scarab of the Blightheart",
                "Blight Scarab of Blooming",
                "Blight Scarab of Invigoration",
                "Blight Scarab of Bounty",
              ],
            },
            {
              name: "Essence",
              scarabs: [
                "Essence Scarab",
                "Essence Scarab of Ascent",
                "Essence Scarab of Stability",
                "Essence Scarab of Calcification",
                "Essence Scarab of Adaptation",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 30,
      columns: [
        {
          groups: [
            {
              name: "Breach",
              scarabs: [
                "Breach Scarab",
                "Breach Scarab of Lordship",
                "Breach Scarab of Splintering",
                "Breach Scarab of Snares",
                "Breach Scarab of Resonant Cascade",
                "Breach Scarab of the Dreamer",
              ],
            },
          ],
        },
      ],
    },
    {
      gap: 40,
      scuffed: true,
      columns: [
        {
          groups: [
            {
              name: "Miscellaneous",
              wide: true,
              scarabs: [
                "Scarab of Monstrous Lineage",
                "Scarab of Adversaries",
                "Scarab of Divinity",
                "Scarab of Hunted Traitors",
              ],
            },
            {
              name: "",
              wide: true,
              scarabs: [
                "Scarab of Stability",
                "Scarab of Wisps",
                "Scarab of Radiant Storms",
                "Scarab of Bisection",
              ],
            },
          ],
        },
        {
          groups: [
            {
              name: "Horned",
              wide: true,
              scarabs: [
                "Horned Scarab of Bloodlines",
                "Horned Scarab of Nemeses",
                "Horned Scarab of Preservation",
                "Horned Scarab of Awakening",
                "Horned Scarab of Tradition",
              ],
            },
            {
              name: "",
              wide: true,
              scarabs: [
                "Horned Scarab of Glittering",
                "Horned Scarab of Pandemonium",
              ],
            },
          ],
        },
      ],
    },
  ],
}
