import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoHome } from "../navigators";

test.beforeEach(gotoHome);

async function moveToEditorSelection(page: Page): Promise<Locator> {
  await test.step("利用規約に同意する", async () => {
    await expect(page.getByText("利用規約に関するお知らせ")).toBeVisible({
      timeout: 90 * 1000,
    });
    await page.getByRole("button", { name: "同意して使用開始" }).click();
  });

  await test.step("キャラクターの並び順を確定する", async () => {
    const completeButton = page.getByRole("button", { name: "完了" });
    await expect(completeButton).toBeVisible();
    await completeButton.click();
  });

  await test.step("テレメトリーを許可する", async () => {
    const allowButton = page.getByRole("button", { name: "許可" });
    await expect(allowButton).toBeVisible();
    await allowButton.click();
  });

  return await test.step("エディタ選択を表示する", async () => {
    const dialog = page.getByRole("dialog", {
      name: "どちらに興味がありますか？",
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText("興味のあるエディターを選んでください。"),
    ).toBeVisible();
    await expect(dialog.getByRole("button", { name: "トーク" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "ソング" })).toBeVisible();
    return dialog;
  });
}

test("起動時に利用規約を表示する", async ({ page }) => {
  await test.step("利用規約ダイアログを表示する", async () => {
    await expect(page.getByText("利用規約に関するお知らせ")).toBeVisible({
      timeout: 90 * 1000,
    });
  });

  await test.step("利用規約の内容を表示する", async () => {
    await expect(page.getByText("ダミー利用規約")).toBeVisible();
  });

  await test.step("エディタ切替を表示しない", async () => {
    await expect(
      page.getByRole("button", { name: "トーク", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "ソング", exact: true }),
    ).toHaveCount(0);
  });
});

for (const label of ["トーク", "ソング"] as const) {
  test(`初回設定で${label}を選択できる`, async ({ page }) => {
    const dialog = await moveToEditorSelection(page);

    await test.step(`${label}を選択する`, async () => {
      await dialog.getByRole("button", { name: label }).click();
    });

    await test.step(`${label}画面へ遷移する`, async () => {
      await expect(dialog).toBeHidden();
      await expect(
        page.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    await test.step("再起動後も選択結果を復元する", async () => {
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "どちらに興味がありますか？" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true", { timeout: 90 * 1000 });
    });
  });
}
