import fs from 'fs';
import { BackpackEntry } from '../../src/types';
import toFind from './itemsToFind';
import { ParsedItem } from './type';

if(!fs.existsSync('./datasets/all-steam.json') || !fs.existsSync('./datasets/all-tf2.json')) {
    throw new Error(`
        Datasets are missing, this script needs all-steam.json and all-tf2.json files that contain backpack data.
    `);
}

const values = JSON.parse(fs.existsSync('./testset.json') ? fs.readFileSync('./testset.json', {encoding: 'utf-8'}) : '{}');
const allSteam = JSON.parse(fs.readFileSync('./datasets/all-steam.json', { encoding: 'utf-8'})) as ParsedItem[];
const allTf2 = JSON.parse(fs.readFileSync('./datasets/all-tf2.json', { encoding: 'utf-8'})) as Record<string, BackpackEntry>;


console.log(toFind);

for(const [name, condition] of Object.entries(toFind)) {
    if(values[name]) continue;

    for(const item of allSteam) {
        let use = true;
        for(const key of Object.keys(condition)) {
            //@ts-ignore
            const attribute = item[key];
            //@ts-ignore
            const test = condition[key];

            if(typeof test === 'function') {
                if(!test(attribute)) {
                    use = false;
                    break;
                };
                continue;
            } 
            if (Array.isArray(test) && Array.isArray(attribute)) {
                for (const value of test) {
                    if(!attribute.includes(value)) {
                        use = false;
                        break;
                    }
                }
                continue;
            }

            if(test !== attribute) {
                use = false;
                break;
            }
        }

        if(!use) continue;
        const tf2Equivalent = allTf2[item.assetid];
        if(!tf2Equivalent) {

            console.error('unable to find tf2 equivalent for ' + item.assetid);
            continue;
        }

        console.log(`Test for match ${name} was found ${item.assetid}`);
        values[name] = {
            tf2: tf2Equivalent,
            steam: item
        };
        break;
    }
    if(!values[name]) {
        console.error([`not met: ${name}`, condition]);
    }
}


fs.writeFileSync('./testset.json', JSON.stringify(values));




