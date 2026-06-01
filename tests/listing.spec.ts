import { LocatorSelector } from '../ai-space/handlers/locator-selector';
import { test, expect } from '../fixtures/login-page';
import { ListingPage } from '../pages/listing.page';

test.describe('Inventory listing page tests', () => {
    test('Verify the product counts on the inventory page', async ({ loginPage, page }) => {
        const listingPage = new ListingPage(page);
        const productCount = await listingPage.getProductCount();
        console.log(`Product count: ${productCount}`);
        expect(productCount).toEqual(6);
    });

    test('verify the are sorting on the inventory page', async ({ loginPage, page }) => {
        const listingPage = new ListingPage(page);
        const locatorSelector = new LocatorSelector(page);

        // Verify that the products are sorted by name in ascending order by default
        const productNames = await listingPage.getProductNames();
        console.log(`Product names: ${productNames}`);
        const sortedProductNamesAsc = [...productNames].sort();

        expect(productNames).toEqual(sortedProductNamesAsc);

        // Verify that the products are sorted by name in descending order when the appropriate option is selected
        await (
            await locatorSelector.findLocator(
                listingPage.sort_dropdown,
                ".header_secondary_container",
            )
        ).selectOption("za");
        const productNamesAfterSorting = await listingPage.getProductNames();
        const sortedProductNamesDesc = [...productNames].reverse();

        expect(productNamesAfterSorting).toEqual(sortedProductNamesDesc);
    });

    test('verify the product prices on the inventory page', async ({ loginPage, page }) => {
        const listingPage = new ListingPage(page);
        const locatorSelector = new LocatorSelector(page);

        // Verify that the product prices are displayed in low to high order when the appropriate option is selected
        const productPrices = await listingPage.getProductPrices();
        console.log(`Product prices: ${productPrices}`);
        const sortedProductPricesHighToLow = [...productPrices].sort((a, b) => a - b);

        await (
            await locatorSelector.findLocator(
                listingPage.sort_dropdown,
                ".header_secondary_container",
            )
        ).selectOption("lohi");
        const productPricesLowToHigh = await listingPage.getProductPrices();
        expect(productPricesLowToHigh).toEqual(sortedProductPricesHighToLow);

        // Verify that the product prices are displayed in high to low order when the appropriate option is selected
        const sortedProductPricesLowToHigh = [...productPrices].sort((a, b) => b - a);

        await (
            await locatorSelector.findLocator(
                listingPage.sort_dropdown,
                ".header_secondary_container",
            )
        ).selectOption("hilo");
        const productPricesHighToLow = await listingPage.getProductPrices();
        expect(productPricesHighToLow).toEqual(sortedProductPricesLowToHigh);
    });
});
