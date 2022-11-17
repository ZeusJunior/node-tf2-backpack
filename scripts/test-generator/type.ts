export interface ParsedItem {
    assetid: string
    imageUrl: string
    name: string
    effect?: string
    quality: string
    tradable: boolean
    craftable: boolean
    wep: boolean
    class: string[]
    killstreaker: string
    sheen: string
    parts: string[]
    spells: string[]
    paint: string
    wear?: string
    australium?: boolean
    lowcraft?: number
    nameTag?: string
    descriptionTag?: string
}