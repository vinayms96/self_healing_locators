import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { ListingPage } from "../pages/listing.page";
import { getUserCredentials } from "../utils/credentials";
import { LocatorSelector } from "../ai-space/handlers/locator-selector";

/**
 * This file defines a custom test fixture for the login page of the saucedemo application. It extends the base test fixture provided by Playwright to include a loginPage fixture that handles the login process before executing tests that require authentication. The fixture navigates to the login page, performs the login action using valid credentials, and ensures that the user is redirected to the inventory page. After the tests are executed, it performs a logout action to reset the state for subsequent tests.
 * The fixture also includes assertions to verify that the login and logout processes work correctly, ensuring that the user is redirected to the appropriate pages and that the relevant elements are visible after each action.
 */
export const test = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        const listingPage = new ListingPage(page);
        const locatorSelector = new LocatorSelector(page);
        const creds = getUserCredentials('standard_user');

        // Navigate to the login page and perform login before tests that require authentication
        await page.goto('/');
        await loginPage.getPageTitle();
        await loginPage.login(creds.username, creds.password);

        // Landing page
        expect(await listingPage.getPageTitle()).toHaveText('Products');

        // Verify that the user is redirected to the inventory page
        await expect(page).toHaveURL(/.*saucedemo.com\/inventory.html/);

        // Tests will start from the inventory page after login, so we can reuse the loginPage fixture for all tests that require authentication.
        await use(loginPage);

        // logout after tests are done to reset state for next tests
        await loginPage.logout();

        // Verify that the user is redirected back to the login page after logout
        await expect(page).toHaveURL(/.*saucedemo.com\/$/);
        await expect(
            await locatorSelector.findLocator(
                loginPage.login_button,
                "#login_button_container",
            ),
        ).toBeVisible();
    }
});

export { expect } from "@playwright/test";
