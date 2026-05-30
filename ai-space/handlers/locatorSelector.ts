import { Locator, Page } from "@playwright/test";
import { locatorHealer } from "./locator-heal";

export class LocatorSelector {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Handles job handoff between finding locator in DOM or via AI
    async findLocator(locator: Locator, blockToLookFor?: string): Promise<Locator> {
        const primaryLocator = await this.findWithOriginalLocator(locator);
        if (primaryLocator !== null) return primaryLocator;

        const alternateLocator = await this.findWithAiLocatorFinder(locator, blockToLookFor);
        if(alternateLocator !== null) return alternateLocator;

        throw new Error('Original and Ai locator finder couldn\'t find the locators');
    }

    // Checks if the locator exists in DOM
    async findWithOriginalLocator(locator: Locator): Promise<Locator | null> {
        try {
            await locator.first().waitFor({ state: 'attached', timeout: 5000 });
            if (await locator.count() > 0) return locator;
        } catch {
            return null;
        }
        return null;
    }

    // Pass the locator to AI call to find changed or new locator
    async findWithAiLocatorFinder(originalLocator: Locator, blockToLookFor?: string): Promise<Locator | null> {
        let locatorBlock = blockToLookFor ?? 'body';
        try {
            const elements = await this.page.locator(locatorBlock).all();
            const elementSource = (await Promise.all(elements.map(el => el.innerHTML()))).join('\n');
            return await locatorHealer(this.page, originalLocator, elementSource);
        } catch (err) {
            console.error('[LocatorSelector] AI finder failed:', (err as Error).message);
            return null;
        }
    }
}
