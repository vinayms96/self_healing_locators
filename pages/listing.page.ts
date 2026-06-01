import { Page, Locator } from "@playwright/test";

const PAGE_TITLE = ".title";
const PRODUCT_IMAGES = "img.inventory_item_img";
const PRODUCT_CARDS = '[data-test="inventory-item"]';
const PRODUCT_NAMES = '[data-test="inventory-item-name"]';
const PRODUCT_DESCRIPTIONS = '[data-test="inventory-item-desc"]';
const PRODUCT_PRICES = '[data-test="inventory-item-price"]';
const SORT_DROPDOWN = ".product_sort_containe";
const ADD_TO_CART_BUTTON = '[data-test="add-to-cart-<>"]';
const REMOVE_FROM_CART_BUTTON = '[data-test="remove-<>"]';

/**
 * This file defines a Page Object Model (POM) for the listing page of the saucedemo application. The ListingPage class encapsulates the elements and actions related to the inventory page, such as locating the page title, product images, and counting the number of products displayed. It provides a method to retrieve the page title, which can be used in tests to verify that the user has successfully navigated to the inventory page after logging in. The POM helps to abstract away the details of interacting with the page elements, making tests more readable and maintainable.
 */

export class ListingPage {
    readonly page: Page;
    readonly page_title: Locator;
    readonly product_images: Locator;
    readonly product_cards: Locator;
    readonly product_names: Locator;
    readonly product_descriptions: Locator;
    readonly product_prices: Locator;
    readonly sort_dropdown: Locator;
    readonly add_to_cart_button: Locator;

    constructor(page: Page) {
        this.page = page;
        this.page_title = page.locator(PAGE_TITLE);
        this.product_images = page.locator(PRODUCT_IMAGES);
        this.product_cards = page.locator(PRODUCT_CARDS);
        this.product_names = page.locator(PRODUCT_NAMES);
        this.product_descriptions = page.locator(PRODUCT_DESCRIPTIONS);
        this.product_prices = page.locator(PRODUCT_PRICES);
        this.sort_dropdown = page.locator(SORT_DROPDOWN);
        this.add_to_cart_button = page.locator(ADD_TO_CART_BUTTON);
    }

    async getPageTitle(): Promise<Locator> {
        return this.page_title;
    }

    async getProductCards(): Promise<Locator> {
        return this.product_cards;
    }

    async getProductCount(): Promise<number> {
        return await this.product_cards.count();
    }

    async getProductNames(): Promise<string[]> {
        return await this.product_names.allTextContents();
    }

    async getProductDescriptions(): Promise<string[]> {
        return await this.product_descriptions.allTextContents();
    }

    async getProductPrices(): Promise<number[]> {
        const prices = await this.product_prices.allTextContents();
        return prices.map((price) => parseFloat(price.replace("$", "")));
    }

    async addToCart(productName: string): Promise<Locator> {
        const convertedProductName = productName
            .toLowerCase()
            .replace(/\s/g, "-");
        return this.page.locator(
            ADD_TO_CART_BUTTON.replace("<>", convertedProductName),
        );
    }

    async removeFromCart(productName: string): Promise<Locator> {
        const convertedProductName = productName
            .toLowerCase()
            .replace(/\s/g, "-");
        return this.page.locator(
            REMOVE_FROM_CART_BUTTON.replace("<>", convertedProductName),
        );
    }
}
