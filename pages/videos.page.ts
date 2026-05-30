import { Page } from '@playwright/test';

// const HERO_VIDEO = '.hero-wrapper .swiper-wrapper a'
const HERO_VIDEO = '.hero-rapper .swiper-wrapper a'

export class Videos {
    readonly hero_video;

    constructor(page: Page) {
        this.hero_video = page.locator(HERO_VIDEO);
    }
}
