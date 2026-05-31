import { Locator } from "@playwright/test";
import * as fs from "fs";

export type CacheEntry = {
    originalLocator: string;
    alternateLocatorType: any;
    alternateLocatorArgs: any;
    cachedTime: string;
};

const filePath = "ai-space/fixtures/cached-locators.json";

// Read locators from cache if already exists
export function readFromCache(): CacheEntry[] {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return [];
    return JSON.parse(raw);
}

// Write the locator object with new AI identified locators to JSON
export function writeToCache(newLocatorEntry: CacheEntry) {
    const cachedLocators = readFromCache();
    const cachedLocatorIndex = findLocatorInCache(
        newLocatorEntry.originalLocator,
    );

    // Update existing locator if found else add new extry
    if (cachedLocatorIndex !== -1) {
        cachedLocators[cachedLocatorIndex] = newLocatorEntry;
    } else {
        cachedLocators.push(newLocatorEntry);
    }

    // Write to cache
    fs.writeFileSync(filePath, JSON.stringify(cachedLocators, null, 2));
}

// Find the locator from cache and return its index
export function findLocatorInCache(originalLocator: Locator | string) {
    const selector =
        typeof originalLocator === "string"
            ? originalLocator
            : (originalLocator as any)._selector;
    const cachedLocators = readFromCache();

    return cachedLocators.findIndex(
        (entry) => entry.originalLocator === selector,
    );
}
