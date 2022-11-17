const fs = require('fs');

let steam = [];
const tf2 = {};
for(const bpdumps of fs.readdirSync('./tf2backpack/')){
    console.log(`Reading ${bpdumps}`);
    const file = JSON.parse(fs.readFileSync('./tf2backpack/' + bpdumps));

    for(const item of file) {
        tf2[item.id] = item;
    }
}
for(const steamdumps of fs.readdirSync('./steambackpack/')){
    console.log(`Reading ${steamdumps}`);
    const file = JSON.parse(fs.readFileSync('./steambackpack/' + steamdumps));

    steam = steam.concat(file);
}

fs.writeFileSync('./all-steam.json', JSON.stringify(steam));
fs.writeFileSync('./all-tf2.json', JSON.stringify(tf2));

