// TODO: seperate into files etc cleanup
import { eEconItemFlags, spellIndexes } from "./data";
import { Attribute, BackpackEntry, FabricatorAttribute, FabricatorItem, InterpretedAttributes, Interpreters, SchemaImposedProperties, SchemaLookup } from "./types";
import protobuf from 'protobufjs';
import path from "path";
import { isDefined } from "./util";

const getFloat = (data: Buffer) => data.readFloatLE(0);
const getIntFromFloat = (data: Buffer) => Math.round(getFloat(data));
const getInt = (data: Buffer) => data.readUInt32LE(0);
const getBool = (data: Buffer) => Math.round(getFloat(data)) !== 0;
const exists = () => true;
const getHexStringFromFloat = (data: Buffer) => getFloat(data).toString(16);
const getIntFromFloatAsArray = (data: Buffer) => [getIntFromFloat(data)];

// example attributesString: '2014|\x01\x02\x01\x03|\x01\x02\x01\x03|7.000000|\x01\x02\x01\x03|\x01\x02\x01\x03|2012|\x01\x02\x01\x03|\x01\x02\x01\x03|572.000000'
const getFabricatorItem = (attr: Attribute) => {
    const root = protobuf.loadSync(path.resolve(__dirname, '../proto/gc.proto'));
    const messageType = root.lookupType("CAttribute_DynamicRecipeComponent");
    const message = messageType.decode(Buffer.from(attr.value_bytes));
    const object = messageType.toObject(message);

    // For consistency
    object.defindex = object.defIndex;
    delete object.defIndex;
    object.quality = object.itemQuality;
    delete object.itemQuality;

    if (object.attributesString) {
        // excuse the naming here
        const attrs = object.attributesString.split('|');
        const wantedAttrs = [];
        const attributes = [];
        for (let i = 0; i < attrs.length; i+= 3) {
            wantedAttrs.push(parseInt(attrs[i]));
        };
        for (let i = 0; i < wantedAttrs.length; i+= 2) {
            attributes.push({
                def_index: wantedAttrs[i],
                value: wantedAttrs[i+1]
            });
        }
        object.attributes = parseFabricatorAttributes(attributes);
    } else {
        object.attributes = [];
    }

    delete object.attributesString; // Don't need to return that, we return parsed attributes

    return object as FabricatorItem;
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
    133: ["medalNo", getInt],
    // Unusual effect
    134: ["effect", getIntFromFloat],
    142: ["paint", getHexStringFromFloat],
    187: ["crateNo", getIntFromFloat],
    214: ["hasKillEater", exists],
    229: ["craft", getInt],
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
    // 2000-2009 are for fabricator input/output
    // 2012 target is for killstreak kits
    2012: ["target", getFloat],
    2013: ["killstreaker", getFloat],
    2014: ["sheen", getFloat],
    2025: ["killstreakTier", getFloat],
    2027: ["australium", getBool],
    // 2031: ["series", getIntFromFloat], i dont think this appears as a gc attribute
    // Taunt effects are a different attribute, since they only appear when using the taunt
    2041: ["effect", getInt],
    2053: ["festivized", getBool],
};

export function parseItem(item: BackpackEntry, schema: SchemaImposedProperties | undefined) {
    const { hasKillEater, ...attributes } = parseAttributes(item.attribute);
    // crateNo might be imposed by schema lol
    if(!!schema?.crateNo) {
        attributes['crateNo'] = schema.crateNo;
    }

    if(schema?.series) {
        attributes['series'] = schema.series;
    }

    if(isDefined(schema?.paintkit)) {
        attributes['paintkit'] = schema?.paintkit;
    }

    if(isDefined(schema?.target)) {
        attributes['target'] = schema?.target;
    }

    if (hasKillEater === true && item.quality !== 11) {
        // counts kills but isn't strange? elevated quality
        attribute['elevated'] = true;
    }

    const craftable = isCraftable(item, schema);
    const tradable = isTradable(item, schema);
    return {
        ...attributes,
        craftable,
        tradable,
    };
}

/**
 * These are attributes we parse from attributesString
 * They are not Buffers, but numbers. So we can just assign them to the right property
 */
export function parseFabricatorAttributes(fabAttribute: FabricatorAttribute[]) {
    let parsed = {} as InterpretedAttributes;
    for (const attribute of fabAttribute) {
        const [name] = ATTRIBUTE_HANDLERS[attribute.def_index] ?? [];
        if(!name) continue;

        // Trust me
        // @ts-ignore
        parsed[name] = attribute.value;
    }

    return parsed;
}

export function parseAttributes(itemAttributes: Attribute[]) {
    let parsed = {} as InterpretedAttributes;

    const attributes = itemAttributes.map(a => a.def_index);
    for (const attribute of itemAttributes) {
        // We handle all the input/output attributes when we detect attribute 2000. No need to do the same for the rest
        if (attribute.def_index >= 2001 && attribute.def_index <= 2009) continue;

        // For output for fabricators we need to get the defindex from the last attribute 
        // The rest is input items (any 2000 - 2009)
        // We do input and output all at once
        if (attribute.def_index === 2000) {
            let fabricatorDefs = attributes.filter((defindex) => {
                if (defindex >= 2000 && defindex <= 2009) {
                    return defindex;
                }
            });
            const outputDef = fabricatorDefs.reduce(function (acc, current) {
                return Math.max(acc, current);
            });

            const outputItem = getAttribute(itemAttributes, outputDef);

            if (outputItem) {
                parsed.outputItem = getFabricatorItem(outputItem);
                fabricatorDefs.pop();
            }

            parsed.inputItems = [];
            fabricatorDefs.forEach((defindex) => {
                const inputItem = getAttribute(itemAttributes, defindex);
                if (inputItem) parsed.inputItems!.push(getFabricatorItem(inputItem));
            });
            continue;
        }

        const [name, interpret] = ATTRIBUTE_HANDLERS[attribute.def_index] ?? [];
        if(!name) continue;

        const value = interpret(Buffer.from(attribute.value_bytes), attribute);
        /**
         * if return type is an array then if one exists, we concat
         */
        if(isDefined(parsed[name]) && Array.isArray(parsed[name]) && Array.isArray(value)) {
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
    if (TradableAfter && getInt(Buffer.from(TradableAfter.value_bytes)) > Math.floor(Date.now() / 1000) ) return false;

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
