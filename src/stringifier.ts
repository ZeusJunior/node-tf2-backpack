import { spellNames, parts, sheens, killstreakers } from "./data";
import { InterpretedAttributes, Item } from "./types";

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

function isDefined(i: any): i is {} {
    return typeof i !== 'undefined';
};


export function convertToStrings(items: Item<number>[]): Item<string>[] {
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
    });
}