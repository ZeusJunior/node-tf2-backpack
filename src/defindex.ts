// TODO: seperate into files etc cleanup
import { eEconItemFlags, spellIndexes } from "./data";
import { Attribute, BackpackEntry, InterpretedAttributes, Interpreters } from "./types";

const getFloat = (data: Buffer) => data.readFloatLE(0);
const getIntFromFloat = (data: Buffer) => Math.round(getFloat(data));
const getInt = (data: Buffer) => data.readUInt32LE(0);
const getBool = (data: Buffer) => Math.round(getFloat(data)) !== 0;
const getHexStringFromFloat = (data: Buffer) => getFloat(data).toString(16);
const getIntFromFloatAsArray = (data: Buffer) => [getIntFromFloat(data)];


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
    229: ["lowcraft", getInt],
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

export function parseItem(item: BackpackEntry) {
    const attributes = parseAttributes(item.attribute);
    const craftable = isCraftable(item);
    const tradable = isTradable(item);
    return { ...attributes, craftable, tradable };
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

// TODO: Some origin StorePromotion (5) are craftable, such as Mann Co. Store Package. Need to find a way to differentiate
export function isCraftable(item: BackpackEntry) {
    // These items are always uncraftable I have not found any similarities between them so just going by defindex
    // Festivizer
    if ([5839].includes(item.def_index)) return false;

    const attributes = item.attribute.map(a => a.def_index);

    // Not part of economy (also as attribute 777 but unused)
    if (item.flags == eEconItemFlags.kEconItemFlag_NonEconomy) return false;

    // Always tradable = always craftable
    if (attributes.includes(195)) return true;

    // Never craftable
    if (attributes.includes(449)) return false;

    // Items with an expiration date or preview items are not craftable
    if (attributes.includes(302) || item.flags == eEconItemFlags.kEconItemFlagClient_Preview) return false;

    // Explicitly marked as not craftable
    if (item.flags == eEconItemFlags.kEconItemFlag_CannotBeUsedInCrafting ) return false;

    // Items with origin StorePromotion, Foreign, Preview or SteamWorkshopContribution are not craftable
    if ([5, 14, 17, 18].includes(item.origin)) return false;

    // Purchased items (also as attribute 172 but unused) can be used in crafting if explicitly tagged, but not by default
    if (item.origin == 2 && eEconItemFlags.kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012) return false;

    // Items with quality Self-Made, Valve or Community are not craftable
    if ([7, 8, 9].includes(item.quality)) return false; 

    // Has a tool_target_item attribute, this is either a killstreak kit or an unusualifier
    if (attributes.includes(2012)) return false;

    // Has a kill_eater_3 attribute, this is a Soul Gargoyle
    if (attributes.includes(494)) return false;

    // Has a items_traded_in_for attribute with a value equal to 5, this is PROBABLY a stat clock.
    // Other trade-ups that are not stat clocks can have this attribute, but they have a different value.
    const itemsTradedInFor = getAttribute(item.attribute, 748);
    if (itemsTradedInFor && getInt(Buffer.from(itemsTradedInFor.value_bytes.data)) == 5) return false;

    return true;
}

// Note: also attribute 172 but unused
export function isTradable(item: BackpackEntry) {
    // These items are always untradable I have not found any similarities between them so just going by defindex
    // Party Hat, Birthday Noisemaker, Spirit of Giving, Professor Speks
    if ([537, 536, 655, 343].includes(item.def_index)) return false;

    const attributes = item.attribute.map(a => a.def_index);

    // Tradable after x, check if x is in the future
    const TradableAfter = getAttribute(item.attribute, 211);
    if (TradableAfter && getInt(Buffer.from(TradableAfter.value_bytes.data)) > Math.floor(Date.now() / 1000) ) return false;

    // Not part of economy (also as attribute 777 but unused)
    if (item.flags == eEconItemFlags.kEconItemFlag_NonEconomy ) return false;

	// Order matters, always tradable overrides not tradable.
    // 777 NonEconomy should be unused but just in case
	if (attributes.includes(777)) return false;

    // Always tradable
	if (attributes.includes(195)) return true;

    // Not tradable
    // I would check if this value equals 1 but items from the Christmas Stocking (giftapult, random weapon, paint etc)
    // have this attribute set to 0 and are not tradable
    // Checking if free accounts can trade seems to fix FishCake, SpaceChem Pin and a handful of random items
	if (attributes.includes(153) && item.flags != eEconItemFlags.kEconItemFlag_CanBeTradedByFreeAccounts) return false;

    // Items with origin Achievement, Foreign, Preview or SteamWorkshopContribution are not tradable
    if ([1, 14, 17, 18].includes(item.origin)) return false;

    // Store Promotion items can be traded if explicitly tagged, but not by default
    // Yes this says Purchased and Craftability, but it seems to only apply to Mann Co. Caps
    // TODO: later note: Yeah nevermind check item 12243104687. Cow mangler purchased, strangified and killstreakified also has this...
    if (item.origin == 5 && eEconItemFlags.kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012) return false;

    // Items with quality Self-Made, Valve or Community are not tradable
    if ([7, 8, 9].includes(item.quality)) return false; 
    
    // Explicitly marked as not tradable
    if (item.flags == eEconItemFlags.kEconItemFlag_CannotTrade) return false;

    // Has a kill_eater_3 attribute, this is a Soul Gargoyle
    if (attributes.includes(494)) return false;

    // Has a set_employee_number attribute, this is a Mercenary Badge
    if (attributes.includes(143)) return false;

    return true;
}

function getAttribute(attributes: Attribute[], defindex: number) {
    const attr = attributes.filter(a => a.def_index == defindex);
    if (attr.length == 0) return null;
    return attr[0];
};
