export enum eEconItemFlags {
    kEconItemFlag_CannotTrade                                   = 1 << 0,
    kEconItemFlag_CannotBeUsedInCrafting                        = 1 << 1,
    kEconItemFlag_CanBeTradedByFreeAccounts                     = 1 << 2,
    kEconItemFlag_NonEconomy                                    = 1 << 3, // used for items that are meant to not interact in the economy -- these can't be traded, gift-wrapped, crafted, etc.
    kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012    = 1 << 4, // cosmetic items coming from the store are now usable in crafting; this flag is set on all items purchased from the store after this change was made
    kEconItemFlagClient_ForceBlueTeam                           = 1 << 5,
    kEconItemFlagClient_StoreItem                               = 1 << 6,
    kEconItemFlagClient_Preview                                 = 1 << 7, // only set on the client; means "this item is being previewed"
    kEconItemFlags_CheckFlags_AllGCFlags                        = kEconItemFlag_CannotTrade | kEconItemFlag_CannotBeUsedInCrafting | kEconItemFlag_CanBeTradedByFreeAccounts | kEconItemFlag_NonEconomy | kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012,
};

export const paints: Record<string, string> = {
    // The duplicates at the start are the RED-BLU team colors.
    // Including both shades because legacy paints can miss either of these.
    '654740': 'An Air of Debonair',
    '28394D': 'An Air of Debonair',
    '3B1F23': 'Balaclavas Are Forever',
    '18233D': 'Balaclavas Are Forever',
    'C36C2D': 'Cream Spirit',
    'B88035': 'Cream Spirit',
    '483838': "Operator's Overalls",
    '384248': "Operator's Overalls",
    'B8383B': 'Team Spirit',
    '5885A2': 'Team Spirit',
    '803020': 'The Value of Teamwork',
    '256D8D': 'The Value of Teamwork',
    'A89A8C': 'Waterlogged Lab Coat',
    '839FA3': 'Waterlogged Lab Coat',
    '2F4F4F': 'A Color Similar to Slate',
    '7D4071': 'A Deep Commitment to Purple',
    '141414': 'A Distinctive Lack of Hue',
    'BCDDB3': `A Mann's Mint`,
    '2D2D24': 'After Eight',
    '7E7E7E': 'Aged Moustache Grey',
    'E6E6E6': 'An Extraordinary Abundance of Tinge',
    'E7B53B': 'Australium Gold',
    'D8BED8': 'Color No. 216-190-216',
    'E9967A': 'Dark Salmon Injustice',
    '808000': 'Drably Olive',
    '729E42': 'Indubitably Green',
    'CF7336': 'Mann Co. Orange',
    'A57545': 'Muskelmannbraun',
    '51384A': `Noble Hatter's Violet`,
    'C5AF91': 'Peculiarly Drab Tincture',
    'FF69B4': 'Pink as Hell',
    '694D3A': 'Radigan Conagher Brown',
    '32CD32': 'The Bitter Taste of Defeat and Lime',
    'F0E68C': `The Color of a Gentlemann's Business Pants`,
    '7C6C57': 'Ye Olde Rustic Colour',
    '424F3B': `Zepheniah's Greed`
}

export const parts: Record<number, string> = {
    // 0: "Kills",
    // 1: "Ubers",
    2: "Kill Assists",
    // 3: "Sentry Kills",
    // 4: "Sodden Victims",
    // 5: "Spies Shocked",
    // 6: "Heads Taken",
    // 7: "Humiliations",
    // 8: "Gifts Given",
    // 9: "Deaths Feigned",
    10: "Scouts Killed",
    11: "Snipers Killed",
    12: "Soldiers Killed",
    13: "Demomen Killed",
    14: "Heavies Killed",
    15: "Pyros Killed",
    16: "Spies Killed",
    17: "Engineers Killed",
    18: "Medics Killed",
    19: "Buildings Destroyed",
    20: "Projectiles Reflected",
    21: "Headshot Kills",
    22: "Airborne Enemy Kills",
    23: "Gib Kills",
    // 24: "Buildings Sapped",
    // 25: "Tickle Fights Won",
    // 26: "Opponents Flattened",
    27: "Kills Under A Full Moon",
    28: "Dominations",
    30: "Revenges",
    31: "Posthumous Kills",
    32: "Teammates Extinguished",
    33: "Critical Kills",
    34: "Kills While Explosive-Jumping",
    36: "Sappers Destroyed" /*"Sappers Removed"*/,
    37: "Cloaked Spies Killed",
    38: "Medics Killed That Have Full ÜberCharge",
    39: "Robots Destroyed",
    40: "Giant Robots Destroyed",
    44: "Kills While Low Health",
    45: "Kills During Halloween",
    46: "Robots Killed During Halloween",
    47: "Defender Kills",
    48: "Submerged Enemy Kills",
    // 49: "Kills While Invuln ÜberCharged",
    // 50: "Food Items Eaten",
    // 51: "Banners Deployed",
    // 58: "Seconds Cloaked",
    // 59: "Health Dispensed to Teammates",
    // 60: "Teammates Teleported",
    61: "Tanks Destroyed",
    62: "Long-Distance Kills",
    // 63: "KillEaterEvent_UniquePlayerKills",
    // 64: "Points Scored",
    // 65: "Double Donks",
    // 66: "Teammates Whipped",
    67: "Kills during Victory Time",
    68: "Robot Scouts Destroyed",
    74: "Robot Spies Destroyed",
    77: "Taunt Kills",
    78: "Unusual-Wearing Player Kills",
    79: "Burning Player Kills",
    80: "Killstreaks Ended",
    81: "Freezecam Taunt Appearances",
    82: "Damage Dealt",
    83: "Fires Survived",
    84: "Allied Healing Done",
    85: "Point Blank Kills",
    // 86: "Wrangled Sentry Kills",
    87: "Kills",
    88: "Full Health Kills",
    89: "Taunting Player Kills",
    /*
    90: "Carnival Kills",
    91: "Carnival Underworld Kills",
    92: "Carnival Games Won",
    */
    93: "Not Crit nor MiniCrit Kills",
    94: "Player Hits" /* "Player Hits" */,
    95: "Assists",
    //96: "Contracts Completed",
    97: "Kills",
    /* 98: "Contract Points",
    99: "Contract Bonus Points",
    100: "Times Performed",
    101: "Kills and Assists during Invasion Event",
    102: "Kills and Assists on 2Fort Invasion",
    103: "Kills and Assists on Probed",
    104: "Kills and Assists on Byre",
    105: "Kills and Assists on Watergate",
    106: "Souls Collected",
    107: "Merasmissions Completed",
    108: "Halloween Transmutes Performed",
    109: "Power Up Canteens Used",
    110: "Contract Points Earned",
    111: "Contract Points Contributed To Friends",*/
}; 

export const partDefindexes = Object.keys(parts);


export const spellNames: Record<number, string> = {
    1006: "Voices From Below",
    1007: "Pumpkin Bombs",
    1008: "Halloween Fire",
    1009: "Exorcism",
    8900: "Putrescent Pigmentation",
    8901: "Die Job",
    8902: "Chromatic Corruption",
    8903: "Spectral Spectrum",
    8904: "Sinister Staining",
    8914: "Team Spirit Footprints",
    8915: "Gangreen Footprints",
    8916: "Corpse Gray Footprints",
    8917: "Violent Violet Footprints",
    8918: "Rotten Orange Footprints",
    8919: "Bruised Purple Footprints",
    8920: "Headless Horseshoes"
};

export const spellIndexes: Record<number, Record<number, number>> = {
    1004: {
        0: 8901,
        1: 8902,
        2: 8900,
        3: 8903,
        4: 8904
    },
    1005: {
        1: 8914,
        2: 8920,
        3100495: 8916,
        5322826: 8917,
        8208497: 8919,
        8421376: 8915,
        13595446: 8918
    },
};

export const sheens: Record<number, string | undefined> = {
    1: "Team Shine",
    2: "Deadly Daffodil",
    3: "Manndarin",
    4: "Mean Green",
    5: "Agonizing Emerald",
    6: "Villainous Violet",
    7: "Hot Rod"
}
  
export const killstreakers: Record<number, string | undefined> = {
    2002: "Fire Horns",
    2003: "Cerebral Discharge",
    2004: "Tornado",
    2005: "Flames",
    2006: "Singularity",
    2007: "Incinerator",
    2008: "Hypno-Beam"
}

export const mapHexToPaintName = (primaryColor?: string, secondaryColor?: string) => {
    return paints[secondaryColor?.toUpperCase() || ''] || paints[primaryColor?.toUpperCase() || ''];
}