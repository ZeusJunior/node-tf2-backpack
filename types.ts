export type BackpackEntry = {
    attribute: Attribute[],
    equipped_state: any[],
    id: string,
    account_id: number,
    inventory: number,
    def_index: number,
    quantity: 1,
    level: number,
    quality: number,
    flags: number,
    origin: number,
    custom_name: null | string,
    custom_desc: null | string,
    interior_item: any,
    in_use: boolean,
    style: number,
    original_id: string,
    contains_equipped_state: any,
    contains_equipped_state_v2: any,
    position: number
};

export type NodeTF2Backpack = BackpackEntry[];

export interface Attribute {
    def_index: number,
    value: null,
    value_bytes: Buffer
};

// todo: add rest
export type InterpretedAttributes<T extends number | string = number> = {
    spells: T[],
    parts: T[],
    effect: number,
    craftable: boolean,
    tradable: boolean,
    australium?: boolean,
    festivized: boolean,
    sheen: T,
    killstreak: T,
    paint: T,
    wear?: T,
    paintkit: T,
};

export type MainAttributes = {
    assetid: string;
    defindex: number;
    quality: number;
};

export type Item<T extends number | string = number> = MainAttributes & InterpretedAttributes<T>;

export type Interpreter<T extends keyof InterpretedAttributes> = [T, (data: Buffer, attribute: Attribute) => InterpretedAttributes[T]];

export type Interpreters = 
Interpreter<'spells'> |
Interpreter<'parts'> |
Interpreter<'effect'> |
Interpreter<'craftable'> |
Interpreter<'tradable'> |
Interpreter<'australium'> |
Interpreter<'festivized'> |
Interpreter<'sheen'> |
Interpreter<'killstreak'> |
Interpreter<'paint'> |
Interpreter<'wear'> |
Interpreter<'paintkit'>;
