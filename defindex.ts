
import { Attribute, InterpretedAttributes, Interpreter, Interpreters } from "./types";

const getFloat = (data: Buffer) => data.readFloatLE(0);

const getIntFromFloat = (data: Buffer) => Math.round(getFloat(data));

const getBool = (data: Buffer) => Math.round(getFloat(data)) !== 0;

/**
 * Handler for attribute defindexes:
 * 1004
 * 1005
 * 1006
 * 1007
 * 1008
 * 1009
 * 
 * reference: https://pastebin.com/wgMayJeW
 * 
 * return type is an array of a single spell defindex, eg return [3100495];
 */
const getSpell = (data: Buffer, attribute: Attribute) => {};

const ATTRIBUTE_HANDLERS: Record<number, Interpreters> = {
    /* Unusual effect */
    134: ["effect", getIntFromFloat],
    2053: ["festivized", getBool],
};
// todo: the types dont work due to ts bullshit
export default function parseAttributes(itemAttributes: Attribute[], mapToString = false)  {
    let parsed = {} as InterpretedAttributes;
    for (const attribute of itemAttributes) {
        const [name, interpret] = ATTRIBUTE_HANDLERS[attribute.def_index] ?? [];
        if(!name) continue;

        const value = interpret(attribute.value_bytes, attribute);

        /**
         * if return type is an array then if one exists, we concat
         */
        if(typeof parsed[name] !== 'undefined' && Array.isArray(parsed[name])) {
            parsed[name] = parsed[name].concat(value);
            continue;
        }

        parsed[name] = value;
    }
    return parsed;
}
