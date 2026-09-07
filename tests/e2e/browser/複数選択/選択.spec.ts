import { test, expect, type Page } from "@playwright/test";
import { navigateToMain, gotoHome } from "../../navigators";
import { getQuasarMenu } from "../../locators";
import { collectAllAudioCellContents, fillAudioCell } from "../utils";
import { ctrlLike, addAudioCells } from "./utils";

test.beforeEach(async ({ page }) => {
  await gotoHome({ page });

  await navigateToMain(page);
  await page.waitForTimeout(100);

  await addAudioCells(page, 3);
});

type SelectedStatus = {
  active: number;
  selected: number[];
};
/**
 * アクティブなAudioCellと選択されているAudioCellを取得する。
 * 戻り値のインデックスは1から始まる。（nth-childのインデックスと揃えるため）
 */
async function getSelectedStatus(page: Page): Promise<SelectedStatus> {
  const selectedAudioKeys = await page.evaluate(() => {
    const audioCells = [...document.querySelectorAll(".audio-cell")];
    let active: number | undefined;
    const selected: number[] = [];
    for (let i = 0; i < audioCells.length; i++) {
      const audioCell = audioCells[i];
      if (audioCell.classList.contains("active")) {
        active = i + 1;
      }
      if (audioCell.classList.contains("selected")) {
        selected.push(i + 1);
      }
    }
    if (active == undefined) {
      throw new Error("No active audio cell");
    }

    return { active, selected };
  });
  return selectedAudioKeys;
}

test("複数選択：マウス周り", async ({ page }) => {
  let selectedStatus: SelectedStatus;

  // 複数選択していない状態でactiveのAudioCellをクリックしても何も起こらない
  await page.locator(".audio-cell:nth-child(1)").click();

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(1);
  expect(selectedStatus.selected).toEqual([1]);

  // Shift+クリックは前回選択していたAudioCellから今回クリックしたAudioCellまでを選択する
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.down("Shift");
  await page.locator(".audio-cell:nth-child(4)").click();
  await page.keyboard.up("Shift");

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([2, 3, 4]);

  // ただのクリックはactiveAudioKeyとselectedAudioKeysをクリックしたAudioCellだけにする
  await page.locator(".audio-cell:nth-child(2)").click();

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(2);
  expect(selectedStatus.selected).toEqual([2]);

  if (process.platform === "darwin" && !!process.env.CI) {
    // なぜかCmd(Meta)+クリックが動かないのでスキップする
    // FIXME: 動くようにする
    return;
  }

  // Ctrl+クリックは選択範囲を追加する
  await page.keyboard.down(ctrlLike);
  await page.locator(".audio-cell:nth-child(4)").click();
  await page.keyboard.up(ctrlLike);
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([2, 4]);

  // Ctrl+クリックは選択範囲から削除する
  await page.keyboard.down(ctrlLike);
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.up(ctrlLike);
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([4]);

  // activeのAudioCellをCtrl+クリックすると選択範囲から削除して次のselectedのAudioCellをactiveにする
  await page.keyboard.down(ctrlLike);
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.up(ctrlLike);
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([4]);

  // selected内のCharacterButtonをクリックしても選択範囲は変わらない
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.down("Shift");
  await page.locator(".audio-cell:nth-child(4)").click();
  await page.keyboard.up("Shift");

  await page.locator(".audio-cell:nth-child(2) .character-button").click();

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([2, 3, 4]);

  // selected外のCharacterButtonをクリックすると選択範囲をそのAudioCellだけにする
  await page.locator(".audio-cell:nth-child(1)").click();

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(1);
  expect(selectedStatus.selected).toEqual([1]);
});

test("複数選択：キーボード", async ({ page }) => {
  let selectedStatus: SelectedStatus;
  // Shift+下で下方向を選択範囲にする
  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.up("Shift");
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(3);
  expect(selectedStatus.selected).toEqual([2, 3]);

  // ただの下で下方向をactiveにして他の選択を解除する
  await page.keyboard.press("ArrowDown");

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([4]);

  // Shift+上で上方向を選択範囲にする
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.up("Shift");
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(2);
  expect(selectedStatus.selected).toEqual([2, 3, 4]);

  // ただの上で上方向をactiveにして他の選択を解除する
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(1);
  expect(selectedStatus.selected).toEqual([1]);

  // Shift+下で下方向を選択範囲にする
  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.up("Shift");
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(3);
  expect(selectedStatus.selected).toEqual([1, 2, 3]);

  // ただの下で下方向をactiveにして他の選択を解除する

  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([4]);

  // EnterでactiveのAudioCellのテキストフィールドにフォーカスし、複数選択を解除する

  await page.keyboard.down("Shift");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.up("Shift");
  await page.keyboard.press("Enter");

  await page.waitForTimeout(100);

  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(3);
  expect(selectedStatus.selected).toEqual([3]);
});

test("複数選択したAudioCellをDeleteキーで削除できる", async ({ page }) => {
  await test.step("各AudioCellにテキストを入力する", async () => {
    await fillAudioCell(page, 0, "一つ目のセルは削除されません。");
    await fillAudioCell(page, 1, "二つ目のセルは削除されます。");
    await fillAudioCell(page, 2, "三つ目のセルは削除されます。");
    await fillAudioCell(page, 3, "四つ目のセルは削除されません。");
  });

  await test.step("中央のAudioCellを複数選択する", async () => {
    await page.locator(".audio-cell:nth-child(2)").click();
    await page.keyboard.down("Shift");
    await page.locator(".audio-cell:nth-child(3)").click();
    await page.keyboard.up("Shift");
    await expect(page.locator(".audio-cell.selected")).toHaveCount(2);
  });

  await test.step("Deleteキーで選択したAudioCellを削除する", async () => {
    await page.keyboard.press("Delete");
  });

  await test.step("選択していないAudioCellだけが残る", async () => {
    await expect(page.locator(".audio-cell")).toHaveCount(2);
    expect(await collectAllAudioCellContents(page)).toEqual([
      "一つ目のセルは削除されません。",
      "四つ目のセルは削除されません。",
    ]);
  });
});

test("テキスト入力中のDeleteキーではAudioCellを削除しない", async ({
  page,
}) => {
  const textField = page.getByRole("textbox", { name: "1行目" });

  await test.step("テキストを入力する", async () => {
    await textField.fill("テストです");
  });

  await test.step("入力中にDeleteキーで一文字を削除する", async () => {
    await textField.press("Home");
    await textField.press("ArrowRight");
    await textField.press("Delete");
  });

  await test.step("AudioCellを維持してテキストだけを変更する", async () => {
    await expect(page.locator(".audio-cell")).toHaveCount(4);
    await expect(textField).toHaveValue("テトです");
  });
});

test("単独選択したAudioCellをDeleteキーで削除しない", async ({ page }) => {
  const audioCell = page.locator(".audio-cell").nth(1);

  await test.step("AudioCellを単独選択してrootにフォーカスする", async () => {
    await audioCell.click();
    await audioCell.focus();
    await expect(audioCell).toHaveClass(/active/);
    await expect(page.locator(".audio-cell.selected")).toHaveCount(1);
  });

  await test.step("Deleteキーを押す", async () => {
    await page.keyboard.press("Delete");
  });

  await test.step("AudioCellを維持する", async () => {
    await expect(page.locator(".audio-cell")).toHaveCount(4);
  });
});

test("複数削除を一回のUndoで復元できる", async ({ page }) => {
  await test.step("各AudioCellにテキストを入力する", async () => {
    await fillAudioCell(page, 0, "一つ目のセルは削除されません。");
    await fillAudioCell(page, 1, "二つ目のセルは削除されます。");
    await fillAudioCell(page, 2, "三つ目のセルは削除されます。");
    await fillAudioCell(page, 3, "四つ目のセルは削除されません。");
  });

  await test.step("中央のAudioCellを複数選択する", async () => {
    await page.locator(".audio-cell:nth-child(2)").click();
    await page.keyboard.down("Shift");
    await page.locator(".audio-cell:nth-child(3)").click();
    await page.keyboard.up("Shift");
  });

  await test.step("Deleteキーで選択したAudioCellを削除する", async () => {
    await page.keyboard.press("Delete");
    await expect(page.locator(".audio-cell")).toHaveCount(2);
  });

  await test.step("元に戻す操作で削除前のAudioCellを復元する", async () => {
    await page.getByRole("button", { name: "編集" }).click();
    await getQuasarMenu(page, "元に戻す").click();
  });

  await test.step("全てのAudioCellを復元する", async () => {
    await expect(page.locator(".audio-cell")).toHaveCount(4);
    expect(await collectAllAudioCellContents(page)).toEqual([
      "一つ目のセルは削除されません。",
      "二つ目のセルは削除されます。",
      "三つ目のセルは削除されます。",
      "四つ目のセルは削除されません。",
    ]);
  });
});

test("複数選択：台本欄の余白クリックで解除", async ({ page }) => {
  let selectedStatus: SelectedStatus;

  await page.locator(".audio-cell:nth-child(2)").click();
  await page.keyboard.down("Shift");
  await page.locator(".audio-cell:nth-child(4)").click();
  await page.keyboard.up("Shift");

  // 念のため確認
  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([2, 3, 4]);

  const scriptArea = page.locator(".audio-cell-pane");
  const boundingBox = await scriptArea.boundingBox();
  if (!boundingBox) {
    throw new Error("No bounding box");
  }
  await scriptArea.click({
    position: {
      x: 10,
      y: boundingBox.height - 10,
    },
  });

  await page.waitForTimeout(100);
  selectedStatus = await getSelectedStatus(page);
  expect(selectedStatus.active).toBe(4);
  expect(selectedStatus.selected).toEqual([4]);
});
