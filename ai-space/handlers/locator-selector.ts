import { Locator, Page } from "@playwright/test";
import { healLocatorByCallingLlmModel } from "./heal-locator";
import { findLocatorInCache, readFromCache } from "../caching/cache-read-write";
import { buildLocatorFromCache } from "./build-locator";

export class LocatorSelector {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Handles job handoff between finding locator in DOM or via AI
    async findLocator(
        locator: Locator,
        blockToLookFor?: string,
    ): Promise<Locator> {
        // Step 1: Find the locator in DOM and return back if exists
        const primaryLocator = await this.findWithOriginalLocator(locator);
        if (primaryLocator !== null) return primaryLocator;

        // Step 2: Find the locator in the cache and return if exists
        const cachedLocator = await this.findWithCachedLocator(locator);
        if (cachedLocator !== null) return cachedLocator;

        // Step 3: Find the locator via AI and return back new locator
        const alternateLocator = await this.findWithAiLocatorFinder(
            locator,
            blockToLookFor,
        );
        if (alternateLocator !== null) return alternateLocator;

        throw new Error(
            "Original and Ai locator finder couldn't find the locators",
        );
    }

    // Checks if the locator exists in DOM
    async findWithOriginalLocator(locator: Locator): Promise<Locator | null> {
        try {
            await locator.first().waitFor({ state: "attached", timeout: 5000 });
            if ((await locator.count()) > 0) return locator;
        } catch {
            return null;
        }
        return null;
    }

    // Pass the locator to AI call to find changed or new locator
    async findWithAiLocatorFinder(
        originalLocator: Locator,
        blockToLookFor?: string,
    ): Promise<Locator | null> {
        let locatorBlock = blockToLookFor ?? "body";
        try {
            const elements = await this.page.locator(locatorBlock).all();
            const elementSource = (
                await Promise.all(elements.map((el) => el.innerHTML()))
            ).join("\n");
            return await healLocatorByCallingLlmModel(
                this.page,
                originalLocator,
                elementSource,
            );
        } catch (err) {
            console.error(
                "[LocatorSelector] AI finder failed:",
                (err as Error).message,
            );
            return null;
        }
    }

    // Find the locator in cache and validate its presence in DOM
    async findWithCachedLocator(
        originalLocator: Locator,
    ): Promise<Locator | null> {
        const cachedLocators = readFromCache();
        const cachedLocatorIndex = findLocatorInCache(originalLocator);

        // Return null if the cache is empty or no locator found
        if (cachedLocatorIndex === -1) return null;

        const locator = await buildLocatorFromCache(
            this.page,
            cachedLocators[cachedLocatorIndex],
        );

        try {
            await locator.first().waitFor({ state: "attached", timeout: 5000 });
            if ((await locator.count()) > 0) return locator;
        } catch {
            return null;
        }
        return null;
    }
}
