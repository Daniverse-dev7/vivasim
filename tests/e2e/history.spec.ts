import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const report = 'Our synthetic project evaluates a local revision planner. '.repeat(6);
async function complete(page: Page) {
  await page.goto('/legacy/index.html');
  await page.locator('#report').fill(report);
  await page.locator('#start').click();
  await page.locator('#answer').fill('We tested the planner with participants because the design needed evidence.');
  await page.locator('#submit').click();
  await page.locator('#finish').click();
}
test('completed sessions persist, deduplicate, export and open without replacing current practice', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await complete(page);
  await expect(page.locator('#save-status')).toHaveText('Session saved on this device.');
  await page.locator('#save-session').click();
  await expect(page.locator('#history-list > article')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#history-list > article')).toHaveCount(1);
  await page.locator('#restart').click();
  await page.locator('#report').fill('Different current report. '.repeat(10));
  await page.getByRole('button',{name:'View saved session',exact:true}).click();
  await expect(page.locator('#history-detail')).toContainText('We tested the planner');
  await expect(page.locator('#report')).toHaveValue('Different current report. '.repeat(10));
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button',{name:'Export saved session',exact:true}).click();
  const download = await downloadEvent;
  const data = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(data.answers).toHaveLength(1);
  expect(data.report).toBeUndefined();
  expect(data.mode).toBe('offline heuristic practice');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('individual and complete history deletion persist across refresh', async ({page}) => {
  await complete(page);
  await expect(page.locator('#history-list > article')).toHaveCount(1);
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button',{name:'Delete saved session',exact:true}).click();
  await expect(page.locator('#history-list > article')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#history-status')).toHaveText('No saved sessions yet.');
  await page.locator('#save-session').click();
  await expect(page.locator('#history-list > article')).toHaveCount(1);
  await page.locator('#clear').click();
  await expect(page.locator('#history-list > article')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#history-status')).toHaveText('No saved sessions yet.');
  await expect(page.locator('#report')).toHaveValue('');
});
test('blocked history storage leaves results and export available', async ({page}) => {
  await page.addInitScript(() => { indexedDB.open = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
  await complete(page);
  await expect(page.locator('#save-status')).toContainText('History storage is unavailable');
  await expect(page.locator('#results-screen')).toBeVisible();
  await expect(page.locator('#export')).toBeEnabled();
});
test('full history refuses new records without evicting existing sessions', async ({page}) => {
  await page.goto('/legacy/index.html');
  await page.evaluate(async () => {
    const path = '/legacy/src/history.mjs';
    const history = await import(path);
    for (let i = 0; i < 50; i++) await history.saveSession({id:`synthetic-${i}`,completedAt:'2026-11-04T12:00:00Z',title:'Synthetic fixture',mode:'offline heuristic practice',questions:['A','B','C','D','E'],answers:[{questionIndex:0,answer:'Test answer',score:50,wordCount:2}]});
  });
  await complete(page);
  await expect(page.locator('#save-status')).toContainText('History is full');
  await expect(page.locator('#history-list > article')).toHaveCount(50);
  await page.reload();
  await expect(page.locator('#history-list > article')).toHaveCount(50);
});
