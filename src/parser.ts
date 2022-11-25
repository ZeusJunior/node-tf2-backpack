// TODO: seperate into files etc cleanup
import { eEconItemFlags, spellIndexes } from "./data";
import { Attribute, BackpackEntry, InterpretedAttributes, Interpreters, SchemaImposedProperties, SchemaLookup } from "./types";

const getFloat = (data: Buffer) => data.readFloatLE(0);
const getIntFromFloat = (data: Buffer) => Math.round(getFloat(data));
const getInt = (data: Buffer) => data.readUInt32LE(0);
const getBool = (data: Buffer) => Math.round(getFloat(data)) !== 0;
const exists = () => true;
const getHexStringFromFloat = (data: Buffer) => getFloat(data).toString(16);
const getIntFromFloatAsArray = (data: Buffer) => [getIntFromFloat(data)];
// dirty way of extracting data for fabricators, defindex is stored at the tail of the last recipe attribute (any 2000 - 2010)
// might be a protobuf but we haven't found a definition yet
const getTargetFromBS = (data: Buffer) => {
    return parseInt(data.toString('utf8', data.lastIndexOf(124), data.length - 4));
}


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

export const ATTRIBUTE_HANDLERS: Record<number, Interpreters> = {
    /* Unusual effect */
    134: ["effect", getIntFromFloat],
    142: ["paint", getHexStringFromFloat],
    214: ["hasKillEater", exists],
    229: ["lowcraft", getInt],
    261: ["paint_other", getHexStringFromFloat],
    380: ["parts", getIntFromFloatAsArray],
    382: ["parts", getIntFromFloatAsArray],
    384: ["parts", getIntFromFloatAsArray],
    725: ["wear", getFloat],
    834: ["paintkit", getInt],
    1004: ["spells", getSpell],
    1005: ["spells", getSpell],
    1006: ["spells", getSpell],
    1007: ["spells", getSpell],
    1008: ["spells", getSpell],
    1009: ["spells", getSpell],
    2000: ['target', getTargetFromBS],
    2001: ['target', getTargetFromBS],
    2002: ['target', getTargetFromBS],
    2003: ['target', getTargetFromBS],
    2004: ['target', getTargetFromBS],
    2005: ['target', getTargetFromBS],
    2006: ['target', getTargetFromBS],
    2007: ['target', getTargetFromBS],
    2008: ['target', getTargetFromBS],
    2009: ['target', getTargetFromBS],
    2010: ['target', getTargetFromBS],
    2012: ["target", getFloat],
    2013: ["killstreaker", getFloat],
    2014: ["sheen", getFloat],
    2025: ["killstreakTier", getFloat],
    2027: ["australium", getBool],
    2053: ["festivized", getBool],
};

export function parseItem(item: BackpackEntry, schema: SchemaImposedProperties | undefined) {
    const { hasKillEater, ...attributes } = parseAttributes(item.attribute);
    const craftable = isCraftable(item, schema);
    const tradable = isTradable(item, schema);
    return {
        ...attributes,
        craftable,
        tradable,
        elevated: hasKillEater && item.quality !== 11, // counts kills but isn't strange? elevated quality
    };
}

export function parseAttributes(itemAttributes: Attribute[])  {
    let parsed = {} as InterpretedAttributes;
    for (const attribute of itemAttributes) {
        const [name, interpret] = ATTRIBUTE_HANDLERS[attribute.def_index] ?? [];
        if(!name) continue;

        const value = interpret(Buffer.from(attribute.value_bytes.data), attribute);
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

export function isCraftable(item: BackpackEntry, schema?: SchemaImposedProperties) {
    const attributes = item.attribute.map(a => a.def_index);

    // Not part of economy (also as attribute 777 but unused)
    if ((item.flags & eEconItemFlags.kEconItemFlag_NonEconomy) != 0) return false;

    // Always tradable = always craftable
    if (attributes.includes(195) || schema?.alwaysTradable) return true;

    // Never craftable
    if (attributes.includes(449) || schema?.nonCraftable) return false;

    // Items with an expiration date or preview items are not craftable
    if (attributes.includes(302) || item.flags == eEconItemFlags.kEconItemFlagClient_Preview) return false;

    // Explicitly marked as not craftable
    if ((eEconItemFlags.kEconItemFlag_CannotBeUsedInCrafting & item.flags) != 0) return false;

    // Items with origin StorePromotion, Foreign, Preview or SteamWorkshopContribution are not craftable
    if ([5, 14, 17, 18].includes(item.origin)) return false;

    // Purchased items (also as attribute 172 but unused) can be used in crafting if explicitly tagged, but not by default
    if (item.origin == 2)  {
        if ((item.flags & eEconItemFlags.kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012) == 0) return false;
        if (!schema?.canCraftIfPurchased) return false;
    }

    // Items with quality Self-Made, Valve or Community are not craftable
    if ([7, 8, 9].includes(item.quality)) return false; 

    return true;
}

// Note: also attribute 172 but unused
export function isTradable(item: BackpackEntry, schema: SchemaImposedProperties | undefined) {
    const attributes = item.attribute.map(a => a.def_index);

    // Tradable after x, check if x is in the future
    const TradableAfter = getAttribute(item.attribute, 211);
    if (TradableAfter && getInt(Buffer.from(TradableAfter.value_bytes.data)) > Math.floor(Date.now() / 1000) ) return false;

    // Not part of economy (also as attribute 777 but unused)
    if ((item.flags & eEconItemFlags.kEconItemFlag_NonEconomy) != 0) return false;

	// Order matters, always tradable overrides cannot trade.
    // 777 NonEconomy should be unused but just in case
	if (attributes.includes(777)) return false;

    // Always tradable
	if (attributes.includes(195) || schema?.alwaysTradable) return true;

    // Not tradable
	if (attributes.includes(153) || schema?.nonTradeable) return false;

    // Items with origin Achievement, Foreign, Preview or SteamWorkshopContribution are not tradable
    if ([1, 14, 17, 18].includes(item.origin)) return false;

    // Items with an expiration date or preview items are not tradable
    if (attributes.includes(302) || item.flags == eEconItemFlags.kEconItemFlagClient_Preview) return false;

    // Items with quality Self-Made, Valve or Community are not tradable
    if ([7, 8, 9].includes(item.quality)) return false; 
    
    // Explicitly marked as not tradable
    if (item.flags == eEconItemFlags.kEconItemFlag_CannotTrade || schema?.nonTradeable) return false;

    return true;
}

function getAttribute(attributes: Attribute[], defindex: number) {
    const attr = attributes.filter(a => a.def_index == defindex);
    if (attr.length == 0) return null;
    return attr[0];
};
