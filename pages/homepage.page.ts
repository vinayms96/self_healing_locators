import { Page } from '@playwright/test';

const VIDEOS_MENU = '[id*="primaryNavigation"] .menu-view [text="Videos"]'

export class Homepage {
    readonly page;
    readonly video_menu;

    constructor(page: Page) {
        this.page = page;
        this.video_menu = page.locator(VIDEOS_MENU);
    }
}
