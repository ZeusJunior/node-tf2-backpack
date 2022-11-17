import { killstreakers, parts, sheens, spellNames } from "../../src/data";
import { ParsedItem } from "./type";

type testName = string;

type ParsedItemOrTestFn = Partial<{[key in keyof Required<ParsedItem>]: ((i: ParsedItem[key]) => boolean) | ParsedItem[key]}>

const toFind: Record<testName, ParsedItemOrTestFn> = {};

// all parts
for(const part of Object.values(parts)){
    toFind[`Single Strange Part: ${part}`] = {
        parts: [part]
    }
}

// all spells
for(const spell of Object.values(spellNames)) {
    toFind[`Single ${spell}`] = {
        spells: [`${spell}`]
    };
}

toFind["Spells: Exo + Fire"] = {
    spells: [`Halloween Fire`,`Exorcism`]
};

toFind["Spells: Exo + PB"] = {
    spells: [`Exorcism`,`Pumpkin Bombs`]
};




// 20 random killstreak combos (seeded)
[...Array(20)].forEach((e, i) => {
    const entry = randomKillsteakCombo(i);
    toFind[entry[0]] = entry[1];
})





export default toFind;

function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function pickRandom(obj: Record<any, any>, offset: number, count = 1) {
    const pRandom = mulberry32(80085 + offset);
    const entries = Object.entries(obj);
    
    const ret: any[] = [];
    while(count > 0) {
        let index = Math.ceil((pRandom() * entries.length) - 1);
        if(ret.includes(entries[index])) continue;
        ret.push(entries[index]);
        count--;
    }
    return ret;
}

function randomKillsteakCombo(offset = 0) {
    const [[a, sheen]] = pickRandom(sheens, 0 + offset);
    const [[b, killstreaker]] = pickRandom(killstreakers, 1 - offset);

    return [`KS Combo (${sheen} + ${killstreaker})`, {
        sheen,
        killstreaker
    }] as const;
}
