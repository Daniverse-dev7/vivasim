import { test, expect, type Page } from '@playwright/test';
const report = 'Our project evaluates a revision planner. '.repeat(10);
async function setup(page: Page, supported = true) {
  await page.addInitScript((enabled) => {
    const state = window as any;
    state.speechStarts = 0;
    class Recognition {
      onresult: any; onend: any; onerror: any;
      start() { state.speechStarts++; state.recognition = this; }
      abort() { this.onend?.(); }
      stop() { this.onend?.(); }
    }
    Object.defineProperty(window, 'SpeechRecognition', {configurable:true, value:enabled ? Recognition : undefined});
    Object.defineProperty(window, 'webkitSpeechRecognition', {configurable:true, value:undefined});
  }, supported);
  await page.goto('/legacy/index.html');
  await page.locator('#report').fill(report);
  await page.locator('#start').click();
}
async function result(page: Page, text: string) {
  await page.evaluate(value => {
    const item: any = [{transcript:value}]; item.isFinal = true;
    (window as any).recognition.onresult({resultIndex:0,results:[item]});
  }, text);
}
test('dictation requires consent and explicit application; answer draft survives refresh', async ({page}) => {
  await setup(page);
  await expect(page.locator('#dictation-start')).toBeDisabled();
  expect(await page.evaluate(() => (window as any).speechStarts)).toBe(0);
  await page.locator('#answer').fill('Existing answer.');
  await page.locator('#dictation-consent').check();
  await page.locator('#dictation-start').click();
  await result(page, 'We tested five participants.');
  await expect(page.locator('#answer')).toHaveValue('Existing answer.');
  await expect(page.locator('#dictation-apply')).toBeDisabled();
  await page.locator('#dictation-stop').click();
  await page.locator('#dictation-preview').fill('We tested six participants.');
  await page.locator('#dictation-apply').click();
  await expect(page.locator('#answer')).toHaveValue('Existing answer.\n\nWe tested six participants.');
  await page.reload();
  await expect(page.locator('#answer')).toHaveValue('Existing answer.\n\nWe tested six participants.');
  await expect(page.locator('#dictation-consent')).not.toBeChecked();
});
test('revoking consent ignores late results and keeps typed text', async ({page}) => {
  await setup(page);
  await page.locator('#answer').fill('Keep this answer.');
  await page.locator('#dictation-consent').check();
  await page.locator('#dictation-start').click();
  await result(page, 'Captured before stopping.');
  await page.locator('#dictation-consent').uncheck();
  await result(page, 'Late text must be ignored.');
  await expect(page.locator('#dictation-preview')).toHaveValue('Captured before stopping.');
  await expect(page.locator('#answer')).toHaveValue('Keep this answer.');
  await expect(page.locator('#dictation-start')).toBeDisabled();
});
test('question changes discard transcript and invalidate late results', async ({page}) => {
  await setup(page);
  await page.locator('#dictation-consent').check();
  await page.locator('#dictation-start').click();
  await result(page, 'First question answer.');
  await page.locator('#skip').click();
  await result(page, 'Old question result.');
  await expect(page.locator('#dictation-preview')).toHaveValue('');
  await expect(page.locator('#answer')).toHaveValue('');
  await expect(page.locator('#dictation-consent')).not.toBeChecked();
});
test('speech permission errors release controls and keep typed practice available', async ({page}) => {
  await setup(page);
  await page.locator('#dictation-consent').check();
  await page.locator('#dictation-start').click();
  await page.evaluate(() => (window as any).recognition.onerror({error:'not-allowed'}));
  await expect(page.locator('#dictation-status')).toContainText('permission was denied');
  await expect(page.locator('#dictation-start')).toBeEnabled();
  await expect(page.locator('#answer')).toBeEnabled();
});
test('unsupported speech recognition keeps the typed workflow usable', async ({page}) => {
  await setup(page, false);
  await page.locator('#dictation-consent').check();
  await expect(page.locator('#dictation-start')).toBeDisabled();
  await expect(page.locator('#dictation-status')).toContainText('unavailable');
  await page.locator('#answer').fill('A typed answer still works without browser speech services.');
  await page.locator('#submit').click();
  await expect(page.locator('#progress-text')).toHaveText('Question 2 of 5');
});
