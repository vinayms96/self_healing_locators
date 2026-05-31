import { Locator, Page } from "@playwright/test";
import { CacheEntry } from "../caching/cache-read-write";

// Build the locator from the JSON returned by the AI response
export async function buildLocatorFromAiOutput(
    page: Page,
    aiResponse: string,
): Promise<Locator> {
    const { locatorType, locatorArgs } = JSON.parse(aiResponse);
    const builtLocator = (page as any)[locatorType](...locatorArgs);

    console.log("AI: " + builtLocator);
    return builtLocator;
}

// Build the locator from the JSON returned by the Cached response
export async function buildLocatorFromCache(
    page: Page,
    cachedLocator: CacheEntry,
): Promise<Locator> {
    const { alternateLocatorType, alternateLocatorArgs } = cachedLocator;
    const builtLocator = (page as any)[alternateLocatorType](
        ...alternateLocatorArgs,
    );

    console.log("Cached: " + builtLocator);
    return builtLocator;
}
