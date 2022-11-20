# node-tf2-backpack
Typed module to parse the `backpack` property from [node-tf2](https://github.com/DoctorMcKay/node-tf2).  
Using this you no longer have to retrieve your own (bots) backpack from the steam API, which has been having issues with increasing ratelimits.

# Installation (soon)
```
npm install tf2-backpack
```

```ts
import { BackpackParser } from 'tf2-backpack';
const parser = new BackpackParser(itemsGame);
// or
const tf2backpack = require('tf2-backpack');
const parser = new tf2backpack.BackpackParser(itemsGame);
```

# Docs
### Constructor(itemsGame)
- `itemsGame` - `itemSchema` property from node-tf2. See [the docs](https://github.com/DoctorMcKay/node-tf2#itemschema).
Constructs a new BackpackParser.  
It is recommended that you ***save*** the itemSchema. It is not emitted on every connection, as it is cached. Currently working on figuring out a way to maybe force a refresh, but no promises.  

Alternatively, you can also use any vdf parser module and use `items_game` from `items_game.txt` (you can find this [here](https://raw.githubusercontent.com/SteamDatabase/GameTracking-TF2/master/tf/scripts/items/items_game.txt) or [the schema](https://wiki.teamfortress.com/wiki/WebAPI/GetSchema) as items_game_url) as input. It is the same

### parseBackpack
```ts
parseBackpack(backpack: NodeTF2Backpack, mapToString = false): Item<string | number>[] {}
```
- `backpack` - `backpack` property from node-tf2. See [the docs](https://github.com/DoctorMcKay/node-tf2#backpack).
- `mapToString` - set to true to return spells, parts, sheen, killstreaker, killstreakTier and wear as names instead of IDs
- Returns `Item<string | number>[]`