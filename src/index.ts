import { parseItem } from "./defindex";
import { convertToStrings } from "./stringifier";
import { InterpretedAttributes, Item, MainAttributes, NodeTF2Backpack } from "./types";

export default function parseBackpack(backpack: NodeTF2Backpack, mapToString: true): Item<string>[];
export default function parseBackpack(backpack: NodeTF2Backpack, mapToString: false): Item<number>[];
export default function parseBackpack(backpack: NodeTF2Backpack, mapToString = false): Item<string | number>[] {
    const bp = backpack.map((item) => Object.assign<MainAttributes, InterpretedAttributes>({
        assetid: item.id,
        defindex: item.def_index,
        quality: item.quality
    }, parseItem(item) ));
    
    if (!mapToString) return bp;

    return convertToStrings(bp);
}
