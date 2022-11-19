import { ItemsGame, SchemaImposedProperties, SchemaLookup } from "./types"


export function parseItemsGame(itemsGame: ItemsGame) {
    const defindexMap = {} as SchemaLookup
    for(const [defindex, item] of Object.entries(itemsGame['items'])) {
        let prop: SchemaImposedProperties = {};
        let shouldAdd = false;

        const check = (name: any) => {
            if(!!(item.static_attrs?.[name] || item.attributes?.[name])) {
                shouldAdd = true;
                return true;
            }
            return false;            
        }

        if(check("cannot trade")) {
            prop.nonTradeable = true;
        }

        if(check("never craftable")) {
            prop.nonCraftable = true;
        }

        if(check("always tradable")) {
            prop.alwaysTradable = true;
        }

        defindexMap[defindex] = prop;
    }
    return defindexMap;
}