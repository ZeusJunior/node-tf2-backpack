import { convertToStrings, parseAttributes } from "./defindex";
import { InterpretedAttributes, Item, MainAttributes, NodeTF2Backpack } from "./types";

export default function parseBackpack(backpack: NodeTF2Backpack, mapToString = false): Item<number | string>[] {
    const bp = backpack.map((item) => Object.assign<MainAttributes, InterpretedAttributes>({
        assetid: item.id,
        defindex: item.def_index,
        quality: item.quality
    }, parseAttributes(item.attribute)));
    
    if (!mapToString) return bp;

    return convertToStrings(bp);
}

