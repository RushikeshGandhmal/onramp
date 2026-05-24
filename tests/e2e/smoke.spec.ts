import { test, expect } from "@playwright/test";

test.describe("On-Ramp smoke", () => {
  test("home page renders and has the hero CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/On-Ramp/i);
    await expect(page.locator("h1").first()).toContainText(
      /Make meaningful contributions|next OSS issue|in 10 seconds/i
    );
    // search input present
    await expect(page.locator("form input[type='search'], form input[name='q']").first()).toBeVisible();
  });

  test("workspace search renders for an empty query", async ({ page }) => {
    // /app/search is auth-gated when Clerk is configured. In CI without
    // Clerk env vars, middleware is a passthrough so the page renders.
    // When configured it 307s to /sign-in.
    const r = await page.goto("/app/search");
    const status = r?.status() ?? 0;
    if (status >= 200 && status < 300) {
      await expect(page.locator("body")).toContainText(
        /Try one of these|React beginner|What do you want to work on/i
      );
    } else {
      // got redirected — must land on /sign-in
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test("legacy /search redirects into the app shell", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveURL(/\/(app\/search|sign-in)/);
  });

  test("privacy and terms pages render", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(/Privacy/i);

    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText(/Terms/i);
  });

  test("status page renders live checks", async ({ page }) => {
    await page.goto("/status");
    await expect(page.locator("h1")).toContainText(
      /All systems normal|Degraded service/i
    );
    await expect(page.locator("body")).toContainText(/GitHub API/i);
  });

  test("robots and sitemap are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsText = await robots.text();
    expect(robotsText).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("<urlset");
  });

  test("not-found page works", async ({ page }) => {
    const r = await page.goto("/this-page-definitely-does-not-exist");
    expect(r?.status()).toBe(404);
  });
});
