import { parseItem } from "./parser";
import { convertToStrings } from "./stringifier";
import { BackpackEntry, InterpretedAttributes, Item, ItemsGame, MainAttributes, NodeTF2Backpack, SchemaLookup } from "./types";
import { parseItemsGame } from "./util";

export class BackpackParser {
    schemaLookup: SchemaLookup;
    constructor(itemsGame: ItemsGame) {
        this.schemaLookup = parseItemsGame(itemsGame);
    }

    parseBackpack(backpack: NodeTF2Backpack, mapToString: true): Item<string>[];
    parseBackpack(backpack: NodeTF2Backpack, mapToString: false): Item<number>[];
    parseBackpack(backpack: NodeTF2Backpack, mapToString = false): Item<string | number>[] {
        const bp = backpack.map((item) => Object.assign<MainAttributes, InterpretedAttributes>({
            assetid: item.id,
            defindex: item.def_index,
            quality: item.quality,
            quantity: item.quantity
        }, parseItem(item, this.schemaLookup[item.def_index]) ));
        
        if (!mapToString) return bp;

        return convertToStrings(bp);
    }

    parseItem(item: BackpackEntry, mapToString: true): Item<string>;
    parseItem(item: BackpackEntry, mapToString: false): Item<number>;
    parseItem(item: BackpackEntry, mapToString = false): Item<string | number> {
        const parsed = Object.assign<MainAttributes, InterpretedAttributes>({
            assetid: item.id,
            defindex: item.def_index,
            quality: item.quality,
            quantity: item.quantity
        }, parseItem(item, this.schemaLookup[item.def_index]) )
        
        if (!mapToString) return parsed;

        return convertToStrings(parsed);
    }
}

export * from './data';

export {Item, ItemsGame, BackpackEntry, NodeTF2Backpack} from './types';