import { Locator } from "@playwright/test";
import { writeToCache } from "./cache-read-write";

// Build the alternate locator object and write to cache
export function cacheAlternateLocator(
    originalLocator: Locator,
    aiResponse: string,
) {
    const { locatorType, locatorArgs } = JSON.parse(aiResponse);

    const alternateLocatorObject = {
        originalLocator: (originalLocator as any)._selector,
        alternateLocatorType: locatorType,
        alternateLocatorArgs: locatorArgs,
        cachedTime: new Date().toISOString(),
    };

    writeToCache(alternateLocatorObject);
}
