import { Page } from "@playwright/test";

const VIDEO_PLAYER_NORMAL = "#main h1";
const VIDEO_PLAYER = "#main title";

export class VideoPlayer {
    readonly video_player_normal;
    readonly video_player;

    constructor(page: Page) {
        this.video_player_normal = page.locator(VIDEO_PLAYER_NORMAL);
        this.video_player = page.locator(VIDEO_PLAYER);
    }
}
