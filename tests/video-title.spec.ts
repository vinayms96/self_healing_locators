import { test, expect } from "@playwright/test";
import { Homepage } from "../pages/homepage.page";
import { Videos } from "../pages/videos.page";
import { VideoPlayer } from "../pages/video-player.page";
import { LocatorSelector } from "../ai-space/handlers/locator-selector";

test.describe("Test with normal locators", async () => {
    test.setTimeout(60000);
    test("Check video title", async ({ page }) => {
        const homepage = new Homepage(page);
        const videos = new Videos(page);
        const videoPlayer = new VideoPlayer(page);

        await page.goto("https://www.icc-cricket.com/");
        await homepage.video_menu_normal.click();
        await videos.hero_video_normal.first().click();
        await expect(videoPlayer.video_player_normal).toHaveText(
            "Suryakumar Yadav relives India's historic triumph | T20WC 2026",
        );
    });

    test.only("Test with self healing locators", async ({ page }) => {
        const locatorSelector = new LocatorSelector(page);
        const homepage = new Homepage(page);
        const videos = new Videos(page);
        const videoPlayer = new VideoPlayer(page);

        await page.goto("https://www.icc-cricket.com/");
        await (
            await locatorSelector.findLocator(homepage.video_menu, "body nav")
        ).click();
        await (
            await locatorSelector.findLocator(
                videos.hero_video,
                ".swiper-wrapper",
            )
        )
            .first()
            .click();
        await expect(
            await locatorSelector.findLocator(
                videoPlayer.video_player,
                "section",
            ),
        ).toHaveText(
            "Suryakumar Yadav relives India's historic triumph | T20WC 2026",
        );
    });
});
