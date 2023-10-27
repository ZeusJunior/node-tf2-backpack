export type BackpackEntry = {
    attribute: Attribute[];
    equipped_state: EquippedState[];
    id: string;
    account_id: number;
    inventory: number;
    def_index: number;
    quantity: number; // number of uses
    level: number;
    quality: number;
    flags: number;
    origin: number;
    custom_name: null | string;
    custom_desc: null | string;
    interior_item: null | BackpackEntry; // Yes, this is another BackpackEntry
    in_use: boolean;
    style: number;
    original_id: null | string;
    contains_equipped_state: null; // deprecated
    contains_equipped_state_v2: boolean; // will be set to true even if equipped_state is an empty array, meaning "unequipped from everything"
    position: number;
};

export type NodeTF2Backpack = BackpackEntry[];

export interface Attribute {
    def_index: number;
    value: null; // deprecated
    value_bytes: Buffer
};

export interface FabricatorAttribute {
    def_index: number;
    value: number;
};

export interface EquippedState {
    new_class: number;
    new_slot: number;
}

export type InterpretedAttributes<T extends number | string = number> = {
    spells?: T[];
    parts?: T[];
    effect?: number;
    craftable: boolean;
    tradable: boolean;
    australium?: boolean;
    festivized?: boolean;
    sheen?: T;
    killstreaker?: T;
    killstreakTier?: T;
    paint?: string;
    paint_other?: string; // This is the paint hex for BLU team (if the paint is team colored)
    wear?: T;
    paintkit?: number;
    craft?: number; // craft number (including > 100)
    crateNo?: number; // crate/case series
    medalNo?: number; // medal number
    target?: number;
    series?: number; // chemistry set series
    // Whether an item is capable of counting kills. Indicates elevated quality if primary quality isnt 11
    // Not returned in Item type, but used in parseItem
    hasKillEater?: boolean;
    elevated?: boolean;
    outputItem?: FabricatorItem<T>;
    inputItems?: FabricatorItem<T>[];
    decal?: UGCID; // applied decal id, see UGCID for more info
};

export type MainAttributes = {
    assetid: string;
    defindex: number;
    quality: number;
};

export type FabricatorItem<T extends number | string = number> = {
    defindex: number,
    quality: number,
    componentFlags: number, // TODO: Figure out what this is
    attributes: {
        sheen?: T;
        killstreaker?: T;
        killstreakTier?: T;
        target?: number;
    }, // attributesString,
    numRequired: number,
    numFulfilled: number
  }

export type Item<T extends number | string> = MainAttributes & Omit<InterpretedAttributes<T>, 'hasKillEater'>;

export type Interpreter<T extends keyof InterpretedAttributes> = [T, (data: Buffer, attribute?: Attribute) => InterpretedAttributes[T]];

export type Interpreters = 
Interpreter<'spells'> |
Interpreter<'parts'> |
Interpreter<'effect'> |
Interpreter<'australium'> |
Interpreter<'festivized'> |
Interpreter<'sheen'> |
Interpreter<'killstreaker'> |
Interpreter<'killstreakTier'> |
Interpreter<'paint'> |
Interpreter<'paint_other'> |
Interpreter<'wear'> |
Interpreter<'paintkit'> |
Interpreter<'craft'> |
Interpreter<'crateNo'> |
Interpreter<'medalNo'> |
Interpreter<'target'>|
Interpreter<'hasKillEater'> |
Interpreter<'series'> | 
Interpreter<'decal'>

export type SchemaImposedProperties = Partial<{
    nonTradeable: true,
    nonCraftable: true,
    alwaysTradable: true,
    nonEconomy: true, // pretty sure this one doesnt appear as an imposed schema property
    canCraftIfPurchased: true,
    crateNo: number,
    series: number,
    paintkit: number,
    target: number
}>

export type SchemaLookup = {[key: string]: SchemaImposedProperties | undefined};

export type ItemsGame = {
    items: Record<number, ItemsGameItem> 
    [key: string]: object
}
// inciomplete definition because we only need these

type ItemsGameItem = {
    // theres no guarantee any of these will be there
    attributes?: {
        [key: string]: {
            attribute_class: string,
            value: string
        }
    },
    // theres two attributes properties, apparently attributes is old according to comments?
    static_attrs?: {
        [key: string]: string
    },
    // needed to check if craftable if purchased
    capabilities?: {
        [key: string]: string
    },
    prefab?: string
    [key: string]: any
}

interface PreserveStringAlias extends String {};

/**  
 * Int64 User Generated Content Identifier.
 * 
 * URL to retrieve the image can be retrieved by sending GET to 
 * ISteamRemoteStorage/GetUGCFileDetails/v1/ 
*/
type UGCID = string & PreserveStringAlias