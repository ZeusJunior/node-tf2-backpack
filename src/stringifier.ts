import { spellNames, parts } from "./data";
import { InterpretedAttributes, Item } from "./types";
import { objectEntries } from "./util";

const getSpellName = (spell: number) => spellNames[spell];
const getPartName = (part: number) => parts[part];

const getWearName = (wear: number) => {
    wear = parseFloat(wear.toFixed(2));
    if (wear === 0.2) return "Factory New";
    if (wear === 0.4) return "Minimal Wear";
    if (wear === 0.6) return "Field-Tested";
    if (wear === 0.8) return "Well-Worn";
    if (wear === 1) return "Battle-Scarred";
    return;
}
const getKillstreakTierName = (tier: number) => {
    if (tier === 1) return "Killstreak";
    if (tier === 2) return "Specialized Killstreak";
    if (tier === 3) return "Professional Killstreak";
    return;
};
const getKillstreakerName = (killstreaker: number) => {
    // TODO
    if (killstreaker === 1) return "Eye effect";
    return;
};
const getSheenName = (sheen: number) => {
    // TODO
    if (sheen === 1) return "Sheen effect";
    return;
};

function isDefined(i: any): i is {} {
    return typeof i !== 'undefined';
};


export function convertToStrings(items: Item<number>[]): Item<string>[] {
    // TODO: convert to string with getWearName, getKillstreakTierName, getKillstreakerName, getSheenName, getPartName, getSpellName
    
    return items.map(stringify);
}

type Remapper = {
  [key in keyof InterpretedAttributes<string>]: (
    value: Required<InterpretedAttributes<number>>[key]
  ) => InterpretedAttributes<string>[key];
};
const REMAPPER: Remapper = {
    'spells': (values: number[]) => values.map(getSpellName),
    'parts': (values: number[]) => values.map(getPartName).filter(isDefined),
    'wear': getWearName,
    'sheen': getSheenName,
    'killstreakTier': getKillstreakTierName,
    'killstreaker': getKillstreakerName
};

// I genuinely dont understand why these types dont work
function stringify(item: Item<number>): Item<string> {
    const stringified = {} as Item<string>;

    for(let [key, value] of objectEntries(item)){
        if(typeof REMAPPER[key as keyof Remapper] !== 'function') {
            // @ts-ignore
            stringified[key] = value;
            continue;
        }
        
        key = key as keyof Remapper;

        // @ts-ignore
        const mappedValue = REMAPPER[key](value);
        if(!mappedValue) continue;

    }
    return stringified;

}