import { ItemsGame, SchemaImposedProperties, SchemaLookup } from "./types"


export function parseItemsGame(itemsGame: ItemsGame) {
    const defindexMap = {} as SchemaLookup
    for(const [defindex, item] of Object.entries(itemsGame['items'])) {
        let prop: SchemaImposedProperties = {};

        const check = (name: any) => {
            if(!!(item.static_attrs?.[name] || item.attributes?.[name])) {
                return true;
            }
            return false;            
        }

        const maybeGetAttribute = (name: string) => {
            let value = item.static_attrs?.[name] || item.attributes?.[name]?.value;
            if(typeof value === 'undefined') return;
            return parseInt(value);
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

        prop.crateNo = maybeGetAttribute("set supply crate series");
        prop.series = maybeGetAttribute("series number");
        prop.paintkit = maybeGetAttribute("paintkit_proto_def_index");
        prop.target = maybeGetAttribute("tool target item");

        
        if (item.capabilities?.can_craft_if_purchased) {
            prop.canCraftIfPurchased = true;
        }

        if (item.prefab) {
            const prefab = item.prefab.split(' ');
            // Never craftable
            if (
                prefab.includes('unusualifier_base') ||
                prefab.includes('killstreakifier_base') ||
                prefab.includes('killstreakifier_kit_basic') // implements killstreakifier_base
            ) {
                prop.nonCraftable = true;
            }

            // Always tradable
            if (prefab.includes('paint_can_team_color')) {
                prop.alwaysTradable = true;
            }

            // Cannot trade
            if (
                prefab.includes('tournament_medal') ||
                prefab.includes('promo') ||
                prefab.includes('score_reward_hat') // implements promo and hat (capability)
            ) {
                prop.nonTradeable = true;
            }

            // Prefabs also have capabilities because yeah why make this easy to decypher
            if (
                prefab.includes('cosmetic') ||
                prefab.includes('taunt') ||
                prefab.includes('map_token') ||
                prefab.includes('triad_trinket') ||
                prefab.includes('champ_stamp') ||
                prefab.includes('marxman') ||
                prefab.includes('cannonball') ||
                prefab.includes('misc') || // implements cosmetic
                prefab.includes('hat') || // implements cosmetic
                prefab.includes('hat_decoration') || // implements cosmetic
                prefab.includes('mask') || // implements misc
                prefab.includes('beard') || // implements misc
                prefab.includes('backpack') || // implements misc
                prefab.includes('grenades') || // implements misc
                prefab.includes('item_bak_firefly') || // implements misc
                prefab.includes('item_bak_fear_monger') || // implements hat
                prefab.includes('item_bak_arkham_cowl') // implements hat
            ) {
                prop.canCraftIfPurchased = true;
            }
        }

        if (Object.keys(prop).filter(isDefined).length > 0) {
            defindexMap[defindex] = prop;
        }
    }
    return defindexMap;
}

export const isDefined = (i: any): i is {} => typeof i !== 'undefined'; 