import { Page } from "@playwright/test";

const HERO_VIDEO_NORMAL = ".hero-wrapper .swiper-wrapper a";
const HERO_VIDEO = ".hero-rapper .swiper-wrapper a";

export class Videos {
    readonly hero_video;
    readonly hero_video_normal;

    constructor(page: Page) {
        this.hero_video = page.locator(HERO_VIDEO);
        this.hero_video_normal = page.locator(HERO_VIDEO_NORMAL);
    }
}
