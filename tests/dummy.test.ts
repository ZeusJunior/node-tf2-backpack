import { expect, test } from '@jest/globals';
import { eEconItemFlags } from '../src/data';
import { isCraftable, isTradable } from '../src/parser';
import { BackpackEntry } from '../src/types';

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

test('combined GC flags keep CannotTrade and Preview restrictions', () => {
    const { kEconItemFlag_CannotTrade, kEconItemFlagClient_Preview, kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012 } = eEconItemFlags;
    const item = (flags: number) => ({ attribute: [], flags, origin: 0, quality: 6 }) as unknown as BackpackEntry;
    const cannotTrade = item(kEconItemFlag_CannotTrade | kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012);
    const preview = item(kEconItemFlagClient_Preview | kEconItemFlag_PurchasedAfterStoreCraftabilityChanges2012);

    expect(isTradable(cannotTrade, undefined)).toBe(false);
    expect(isTradable(preview, undefined)).toBe(false);
    expect(isCraftable(preview)).toBe(false);
});
