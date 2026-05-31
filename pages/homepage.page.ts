import { Page } from "@playwright/test";

const VIDEOS_MENU_NORMAL =
    '[id*="primaryNavigation"] .menu-view [text="Videos"]';

export class Homepage {
    readonly page;
    readonly video_menu_normal;
    readonly video_menu;

    constructor(page: Page) {
        this.page = page;
        this.video_menu_normal = page.locator(VIDEOS_MENU_NORMAL);
        this.video_menu = page.locator(VIDEOS_MENU_NORMAL);
    }
}
