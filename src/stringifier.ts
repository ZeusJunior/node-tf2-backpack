import { spellNames, parts, sheens, killstreakers } from "./data";
import { FabricatorItem, InterpretedAttributes, Item } from "./types";
import { isDefined } from "./util";

const getSpellName = (spell: number) => spellNames[spell];
const getPartName = (part: number) => parts[part];
const getSheenName = (sheen?: number) => sheens[sheen || 0];
const getKillstreakerName = (killstreaker?: number) => killstreakers[killstreaker || 0];

const getWearName = (wear?: number) => {
    if(!wear) return;
    wear = parseFloat(wear.toFixed(2));
    if (wear === 0.2) return "Factory New";
    if (wear === 0.4) return "Minimal Wear";
    if (wear === 0.6) return "Field-Tested";
    if (wear === 0.8) return "Well-Worn";
    if (wear === 1) return "Battle-Scarred";
    return;
}
const getKillstreakTierName = (tier?: number) => {
    if (tier === 1) return "Killstreak";
    if (tier === 2) return "Specialized Killstreak";
    if (tier === 3) return "Professional Killstreak";
    return;
};

export function convertToStrings(items: Item<number>): Item<string>;
export function convertToStrings(items: Item<number>[]): Item<string>[];
export function convertToStrings(items: Item<number>[] | Item<number>): Item<string>[] | Item<string> {
    if (!Array.isArray(items)) return stringify(items);
    return items.map(stringify);
}

function stringify(item: Item<number>): Item<string> {
    return Object.assign(item, {
        spells: item.spells?.map(getSpellName),
        parts: item.parts?.map(getPartName).filter(isDefined),
        sheen: getSheenName(item.sheen),
        killstreaker: getKillstreakerName(item.killstreaker),
        killstreakTier: getKillstreakTierName(item.killstreakTier),
        wear: getWearName(item.wear),
        outputItem: item.outputItem && stringifyFabricatorItem(item.outputItem),
        inputItems: item.inputItems?.map((item) => stringifyFabricatorItem(item))
    });
}

function stringifyFabricatorItem(item: FabricatorItem<number>): FabricatorItem<string> {
    return Object.assign(item, { 
            attributes: {
            sheen: getSheenName(item.attributes.sheen),
            killstreaker: getKillstreakerName(item.attributes.killstreaker),
            killstreakTier: getKillstreakTierName(item.attributes.killstreakTier)
        }
    });
};