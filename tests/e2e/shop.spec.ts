import { test, expect } from "@playwright/test";

/**
 * E2E smoke testy pro /shop.
 * Cílem je zachytit regrese co se v posledních týdnech několikrát staly:
 *   • supplier fotky nezobrazené (broken Next/Image)
 *   • prázdný katalog (DB / fetch error → graceful fallback)
 *   • broken kategoriální URL
 *   • PDP renderování selže
 *
 * Spuštění:
 *   npx playwright test                          # default prod
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
 */

test.describe("Shop smoke", () => {
  test("homepage /shop loads + has filter chips", async ({ page }) => {
    await page.goto("/shop");
    await expect(page).toHaveTitle(/E-shop/i);
    // Filtry jsou pod toggle tlačítkem — klik rozbalí panel se Značka/Pohlaví/…
    await page.getByRole("button", { name: /^Filtry/i }).click();
    // Brand chip musí být po rozbalení viditelný
    const brandChips = page.locator('button[aria-label="ISAAC"], button[aria-label="Scott"]');
    await expect(brandChips.first()).toBeVisible({ timeout: 10_000 });
  });

  test("kategoriální URL /shop/kola/silnicni resolves", async ({ page }) => {
    const response = await page.goto("/shop/kola/silnicni");
    expect(response?.status()).toBe(200);
    // H1 obsahuje název kategorie
    await expect(page.locator("h1")).toContainText(/Silniční/i);
  });

  test("ISAAC kola — produkty se zobrazí s fotkou", async ({ page }) => {
    await page.goto("/shop?cat=kola&brand=isaac");
    // počkat na produkty
    await page.waitForLoadState("networkidle", { timeout: 20_000 });

    // Najít obrázek s ISAAC v alt
    const isaacImages = page.locator('img[alt*="Isaac" i]').first();
    await expect(isaacImages).toBeVisible({ timeout: 15_000 });

    // Verify že image se skutečně načetla (naturalWidth > 0)
    const loaded = await isaacImages.evaluate((el) => {
      const img = el as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    });
    expect(loaded, "ISAAC image se musela skutečně načíst (naturalWidth > 0)").toBe(true);
  });

  test("PDP first ISAAC product opens with gallery", async ({ page }) => {
    await page.goto("/shop/kola/silnicni");
    await page.waitForLoadState("networkidle", { timeout: 20_000 });

    // Najít produktovou kartu (link uvnitř product grid — má img alt s Isaac)
    const productLink = page
      .locator('a[href^="/shop/"]:has(img[alt*="Isaac" i])')
      .first();
    await expect(productLink).toBeVisible({ timeout: 10_000 });
    await productLink.click();
    await page.waitForLoadState("networkidle", { timeout: 20_000 });

    // PDP má H1 + buď „Do košíku" nebo „Sestavit a přidat do košíku" (ISAAC configurator)
    await expect(page.locator("h1")).toBeVisible();
    const cta = page.getByRole("button", { name: /košíku|Sestavit|Domluvit/i });
    await expect(cta.first()).toBeVisible({ timeout: 10_000 });
  });

  test("/wishlist loads without auth", async ({ page }) => {
    const response = await page.goto("/wishlist");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/Oblíbené/i);
  });

  test("/admin/login renders form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText(/Přihlášení/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
