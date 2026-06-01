import { Locator, Page } from "@playwright/test";
import { LocatorSelector } from "../ai-space/handlers/locator-selector";

const PAGE_TITLE = ".login_logo";
const USERNAME = "#user-name";
const PASSWORD = "#password";
const LOGIN_BUTTON = "#login-butto";
const HAMBURGER_MENU = ".bm-burger-button";
const LOGOUT_LINK = "#logout_sidebar_link";
const LOCKED_OUT_ERROR = '[data-test="error"]';

/**
 * The LoginPage class represents the login page of the saucedemo application. It provides methods to interact with the login page elements, such as filling in the username and password, clicking the login button, and performing logout actions. The class uses Playwright's Locator and Page objects to define locators for the relevant elements on the login page and to perform actions on those elements.
 */
export class LoginPage {
    readonly page: Page;
    readonly page_title: Locator;
    readonly username: Locator;
    readonly password: Locator;
    readonly login_button: Locator;
    readonly hamburger_menu: Locator;
    readonly logout_link: Locator;
    readonly locked_out_error: Locator;

    // The constructor initializes the page and locators for the login page. It sets up locators for the page title, username and password input fields, login button, hamburger menu, and logout link. These locators are used in the methods to interact with the elements on the login page.
    constructor(page: Page) {
        this.page = page;
        this.page_title = page.locator(PAGE_TITLE);
        this.username = page.locator(USERNAME);
        this.password = page.locator(PASSWORD);
        this.login_button = page.locator(LOGIN_BUTTON);
        this.hamburger_menu = page.locator(HAMBURGER_MENU);
        this.logout_link = page.locator(LOGOUT_LINK);
        this.locked_out_error = page.locator(LOCKED_OUT_ERROR);
    }

    // Method to get the page title text content
    async getPageTitle(): Promise<string> {
        return (await this.page_title.textContent()) ?? "";
    }

    // Method to check if the hamburger menu is visible (used to determine if the user is logged in)
    async isHamburgerMenuVisible(): Promise<boolean> {
        return await this.hamburger_menu.isVisible();
    }

    // Method to perform login action by filling in the username and password fields and clicking the login button
    async login(username: string, password: string): Promise<void> {
        const locatorSelector = new LocatorSelector(this.page);

        await (
            await locatorSelector.findLocator(
                this.username,
                "#login_button_container",
            )
        ).fill(username);
        await (
            await locatorSelector.findLocator(
                this.password,
                "#login_button_container",
            )
        ).fill(password);
        await (
            await locatorSelector.findLocator(
                this.login_button,
                "#login_button_container",
            )
        ).click();
    }

    // Method to perform logout action by clicking the hamburger menu and then the logout link. It first checks if the hamburger menu is visible to ensure that the user is logged in before attempting to log out.
    async logout(): Promise<void> {
        (await this.isHamburgerMenuVisible()) &&
            (await this.hamburger_menu.click());
        await this.logout_link.click();
    }
}
