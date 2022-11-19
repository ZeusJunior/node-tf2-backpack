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

        if (item.capabilities?.can_craft_if_purchased) {
            shouldAdd = true;
            prop.canCraftIfPurchased = true;
        }

        if (item.prefab) {
            // Never craftable
            if (
                item.prefab.includes('unusualifier_base') ||
                item.prefab.includes('killstreakifier_base') ||
                item.prefab.includes('killstreakifier_kit_basic')
            ) {
                shouldAdd = true;
                prop.nonCraftable = true;
            }

            // Always tradable
            if (item.prefab.includes('paint_can_team_color')) {
                shouldAdd = true;
                prop.alwaysTradable = true;
            }

            // Cannot trade
            if (
                item.prefab.includes('tournament_medal') ||
                item.prefab.includes('promo') ||
                item.prefab.includes('score_reward_hat ')
            ) {
                shouldAdd = true;
                prop.nonTradeable = true;
            }
        }

        if (shouldAdd) {
            defindexMap[defindex] = prop;
        }
    }
    return defindexMap;
}