import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const report = 'Introduction\nOur project is a revision scheduler. Methodology\nWe built a local browser application and tested it with five students. Evaluation\nThree students completed tasks faster. Limitations\nThis sample is too small to establish a general benefit. Future work\nWe will recruit more participants.';
for (const extension of ['pdf', 'docx']) {
  test(`extracts ${extension} locally without uploading report content`, async ({page}) => {
    const requests: string[] = [];
    page.on('request', request => { if (request.method() === 'POST') requests.push(request.url()); });
    await page.goto('/');
    await page.locator('input[type=file]').setInputFiles(`tests/fixtures/report.${extension}`);
    await expect(page.getByLabel('Editable report preview')).toHaveValue(/Our methodology evaluates a browser revision planner/);
    expect(requests).toEqual([]);
  });
}
test('draft survives reload, requires consent, falls back locally, and opens offline practice', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Editable report preview').fill(report);
  await page.reload(); await expect(page.getByLabel('Editable report preview')).toHaveValue(report);
  await expect(page.getByRole('button', {name:'Review with AI'})).toBeDisabled();
  await page.getByRole('checkbox').check(); await page.getByRole('button', {name:'Review with AI'}).click();
  await expect(page.getByRole('region', {name:'Report review'})).toContainText('LOCAL SECTION CHECKLIST');
  await page.getByRole('button', {name:'Continue to offline practice'}).click();
  await expect(page.locator('#report')).toHaveValue(report);
  await page.locator('#start').click();
  for(let i=0;i<5;i++){ await page.locator('#answer').fill('We chose local storage because it supports offline usage, although the design has limitations for synchronizing data across devices.'); await page.locator('#submit').click(); }
  await expect(page.locator('#results-screen')).toBeVisible();
});
test('file upload, draft deletion and mobile accessibility in both themes', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/');
  await page.locator('input[type=file]').setInputFiles({name:'report.md',mimeType:'text/markdown',buffer:Buffer.from(report)});
  await expect(page.getByLabel('Editable report preview')).toHaveValue(report);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Light mode'}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  page.on('dialog', dialog => dialog.accept()); await page.getByRole('button',{name:'Delete local draft'}).click();
  await page.reload(); await expect(page.getByLabel('Editable report preview')).toHaveValue('');
});
test('API rejects missing consent and oversized requests; exposes safe health status', async ({ request }) => {
  expect((await request.post('/api/analyze',{data:{report}})).status()).toBe(400);
  expect((await request.post('/api/analyze',{data:{report:'a'.repeat(130000),consent:true}})).status()).toBe(413);
  expect((await request.get('/api/health')).status()).toBe(200);
});
