// TODO: seperate into files etc cleanup
import { parts } from "./data";
import { Attribute, InterpretedAttributes, Interpreters, Item } from "./types";

const getFloat = (data: Buffer) => data.readFloatLE(0);
const getIntFromFloat = (data: Buffer) => Math.round(getFloat(data));
const getInt = (data: Buffer) => data.readUInt32LE(0);
const getBool = (data: Buffer) => Math.round(getFloat(data)) !== 0;
const getHexStringFromFloat = (data: Buffer) => getFloat(data).toString(16);
const getIntFromFloatAsArray = (data: Buffer) => [getIntFromFloat(data)];

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
const getPartName = (part: number) => parts[part];

const spellIndexes: Record<number, Record<number, number>> = {
    1004: {
        0: 8901,
        1: 8902,
        2: 8900,
        3: 8903,
        4: 8904
    },
    1005: {
        1: 8914,
        2: 8920,
        3100495: 8916,
        5322826: 8917,
        8208497: 8919,
        8421376: 8915,
        13595446: 8918
    },
};
const spellNames: Record<number, string> = {
    1006: "Voices from Below",
    1007: "Pumpkin Bombs",
    1008: "Halloween Fire",
    1009: "Exorcism",
    8900: "Putrescent Pigmentation",
    8901: "Die Job",
    8902: "Chromatic Corruption",
    8903: "Spectral Spectrum",
    8904: "Sinister Staining",
    8914: "Team Spirit Footprints",
    8915: "Gangreen Footprints",
    8916: "Corpse Gray Footprints",
    8917: "Violent Violet Footprints",
    8918: "Rotten Orange Footprints",
    8919: "Bruised Purple Footprints",
    8920: "Headless Horseshoes"
};
const getSpellName = (spell: number) => {
    return spellNames[spell];
};

/**
 * Handler for attribute defindexes:
 * 1004 paint
 * 1005 footprints
 * 1006 Voices from Below
 * 1007 pumpkin bombs
 * 1008 halloween fire
 * 1009 exorcism
 * reference: https://pastebin.com/wgMayJeW
 * 
 * return type is an array of a single spell defindex, eg return [8917];
 * referece: https://pastebin.com/FR8J0j0J
 */
 const getSpell = (data: Buffer, attribute?: Attribute) => {
    if (!attribute) return [0]; // This should never happen, but typescript wants attribute to be optional

    if ([1006, 1007, 1008, 1009].includes(attribute.def_index)) return [attribute.def_index];
    const spell = getIntFromFloat(data);
    return [spellIndexes[attribute.def_index][spell]];
 };

const ATTRIBUTE_HANDLERS: Record<number, Interpreters> = {
    /* Unusual effect */
    134: ["effect", getIntFromFloat],
    142: ["paint", getHexStringFromFloat],
    261: ["paint_other", getHexStringFromFloat],
    380: ["parts", getIntFromFloatAsArray],
    382: ["parts", getIntFromFloatAsArray],
    384: ["parts", getIntFromFloatAsArray],
    1004: ["spells", getSpell],
    1005: ["spells", getSpell],
    1006: ["spells", getSpell],
    1007: ["spells", getSpell],
    1008: ["spells", getSpell],
    1009: ["spells", getSpell],
    725: ["wear", getFloat],
    834: ["paintkit", getInt],
    2013: ["killstreaker", getFloat],
    2014: ["sheen", getFloat],
    2025: ["killstreakTier", getFloat],
    2027: ["australium", getBool],
    2053: ["festivized", getBool],
};

export function parseAttributes(itemAttributes: Attribute[])  {
    let parsed = {} as InterpretedAttributes;
    for (const attribute of itemAttributes) {
        const [name, interpret] = ATTRIBUTE_HANDLERS[attribute.def_index] ?? [];
        if(!name) continue;

        const value = interpret(Buffer.from(attribute.value_bytes), attribute);
        /**
         * if return type is an array then if one exists, we concat
         */
        if(typeof parsed[name] !== 'undefined' && Array.isArray(parsed[name]) && Array.isArray(value)) {
            // We do a little crime
            // @ts-ignore
            parsed[name] = parsed[name].concat(value);
            continue;
        }

        // Real crimeboys
        // @ts-ignore
        parsed[name] = value;
    }

    return parsed;
}

export function convertToStrings(items: Item<number>[]): Item<string>[] {
    // TODO: convert to string with getWearName, getKillstreakTierName, getKillstreakerName, getSheenName, getPartName, getSpellName
    
}