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
    interior_item: BackpackEntry; // Yes, this is another BackpackEntry
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
    value: null;
    value_bytes: number[];
};

export interface EquippedState {
    new_class: number;
    new_slot: number;
}

// todo: add rest
export type InterpretedAttributes<T extends number | string = number> = {
    spells?: T[];
    parts?: T[];
    effect?: number;
    // craftable: boolean;
    // tradable: boolean;
    australium?: boolean;
    festivized?: boolean;
    sheen?: T;
    killstreaker?: T;
    killstreakTier?: T;
    paint?: string;
    paint_other?: string; // name TBD, this is the paint hex for BLU team (if the paint is team colored)
    wear?: T;
    paintkit?: T;
};

export type MainAttributes = {
    assetid: string;
    defindex: number;
    quality: number;
};

export type Item<T extends number | string> = MainAttributes & InterpretedAttributes<T>;

export type Interpreter<T extends keyof InterpretedAttributes> = [T, (data: Buffer, attribute?: Attribute) => InterpretedAttributes[T]];

export type Interpreters = 
Interpreter<'spells'> |
Interpreter<'parts'> |
Interpreter<'effect'> |
// Interpreter<'craftable'> |
// Interpreter<'tradable'> |
Interpreter<'australium'> |
Interpreter<'festivized'> |
Interpreter<'sheen'> |
Interpreter<'killstreaker'> |
Interpreter<'killstreakTier'> |
Interpreter<'paint'> |
Interpreter<'paint_other'> |
Interpreter<'wear'> |
Interpreter<'paintkit'>;
