import { LocatorSelector } from '../ai-space/handlers/locator-selector';
import { test, expect } from '../fixtures/login-page';
import { ListingPage } from '../pages/listing.page';
import { LoginPage } from '../pages/login.page';
import { getUserCredentials } from '../utils/credentials';
import "dotenv/config";

/**
 * This test suite covers the login functionality of the saucedemo application. It includes tests for successful login with valid credentials and logout functionality. The tests utilize a fixture to handle the login process and ensure that the user is logged in before executing tests that require authentication.
 * The first test verifies that a user can log in successfully with valid credentials and is redirected to the inventory page. The second test uses the loginPage fixture to ensure that the user is logged in before executing assertions on the inventory page, and also verifies that the logout functionality works correctly after the tests are completed.
 */
test.describe('Login Tests', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const listingPage = new ListingPage(page);
        const locatorSelector = new LocatorSelector(page);
        const creds = getUserCredentials('standard_user');

        await page.goto('/');
        await loginPage.getPageTitle();
        await loginPage.login(creds.username, creds.password);

        // Landing page
        expect(await listingPage.getPageTitle()).toHaveText('Products');

        // Verify that the user is redirected to the inventory page
        await expect(page).toHaveURL(/.*saucedemo.com\/inventory.html/);
    });

    test('should login successfully and logout successfully via fixture', async ({ loginPage, page }) => {
        const listingPage = new ListingPage(page);
        await expect(await listingPage.addToCart('Sauce Labs Backpack')).toBeVisible(); // Verify that we are logged in and on the inventory page
    });
});
