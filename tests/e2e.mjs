/**
 * Наскрізні тести інтерфейсу в браузері Chromium (бібліотека Playwright).
 * Запуск: node tests/e2e.mjs
 * Змінна CHROME_PATH дозволяє вказати встановлений браузер.
 */
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function startServer() {
  const server = http.createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    const file = path === '' || path === '.' ? 'index.html' : path;
    try {
      const body = await readFile(join(root, file));
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

const VIEWPORTS = [
  { name: 'смартфон', width: 360, height: 740 },
  { name: 'смартфон-L', width: 414, height: 896 },
  { name: 'планшет', width: 768, height: 1024 },
  { name: 'ноутбук', width: 1366, height: 768 },
  { name: 'монітор', width: 1920, height: 1080 }
];

const results = [];
let beforeEach = async () => {};
async function check(id, title, viewport, fn) {
  await beforeEach();
  const started = Date.now();
  try {
    await fn();
    results.push({ id, title, viewport, status: 'passed', ms: Date.now() - started });
  } catch (error) {
    results.push({ id, title, viewport, status: 'failed', ms: Date.now() - started, error: String(error.message || error).split('\n')[0] });
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const server = await startServer();
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: 'uk-UA' });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base);
  beforeEach = async () => { await resetUi(); };
  const total = await page.locator('.card').count();
  const isMobile = vp.width <= 1024;

  const openFilters = async () => { if (isMobile) await page.click('#filters-toggle'); };
  const closeFilters = async () => { if (isMobile) await page.click('#filters-close'); };
  // Повернення інтерфейсу до початкового стану, щоб збій одного тесту не впливав на наступні
  const resetUi = () => page.evaluate(() => {
    document.getElementById('reset-filters').click();
    document.getElementById('filters-close').click();
    if (document.getElementById('product-dialog').open) document.getElementById('product-dialog').close();
  });

  await check('TC-01', 'Каталог відображає всі товари', vp.name, async () => {
    expect(total === 18, `карток: ${total}`);
    expect((await page.textContent('#result-count')).includes('18'), 'лічильник не містить 18');
  });

  await check('TC-02', 'Відсутня горизонтальна прокрутка', vp.name, async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow <= 0, `перевищення ширини: ${overflow}px`);
  });

  await check('TC-03', 'Фільтр за категорією', vp.name, async () => {
    await openFilters();
    await page.check('#filter-categories input[value="mice"]');
    const cats = await page.locator('.card .card__category').allTextContents();
    expect(cats.length === 3 && cats.every((c) => c === 'Миші'), `отримано: ${cats.join(', ')}`);
    await page.click('#reset-filters');
    await closeFilters();
  });

  await check('TC-04', 'Фільтр за діапазоном цін', vp.name, async () => {
    await openFilters();
    await page.fill('#price-min', '1000');
    await page.fill('#price-max', '1500');
    const prices = await page.$$eval('.card .price__current', (n) => n.map((x) => Number(x.textContent.replace(/\D/g, ''))));
    expect(prices.length === 5 && prices.every((p) => p >= 1000 && p <= 1500), `ціни: ${prices.join(', ')}`);
    await page.click('#reset-filters');
    await closeFilters();
  });

  await check('TC-05', 'Пошук за назвою', vp.name, async () => {
    await page.fill('#search', 'колонка');
    expect(await page.locator('.card').count() === 3, 'очікувалось 3 колонки');
    await page.fill('#search', 'неіснуючий товар');
    expect(await page.locator('.empty').isVisible(), 'немає повідомлення про порожній результат');
    await page.fill('#search', '');
  });

  await check('TC-06', 'Сортування за зростанням ціни', vp.name, async () => {
    await page.selectOption('#sort', 'price-asc');
    const prices = await page.$$eval('.card .price__current', (n) => n.map((x) => Number(x.textContent.replace(/\D/g, ''))));
    expect(prices.every((p, i) => i === 0 || prices[i - 1] <= p), 'порядок порушено');
    await page.selectOption('#sort', 'popular');
  });

  await check('TC-07', 'Детальна картка товару', vp.name, async () => {
    await page.click('.card[data-id="2"] .card__media');
    expect(await page.locator('#product-dialog').isVisible(), 'діалог не відкрився');
    expect((await page.textContent('#details-title')).includes('Studio M2'), 'неправильний товар');
    await page.click('#product-dialog [data-action="close"]');
    expect(!(await page.locator('#product-dialog').isVisible()), 'діалог не закрився');
  });

  await check('TC-08', 'Додавання до кошика та лічильник', vp.name, async () => {
    await page.click('.card[data-id="1"] [data-action="add"]');
    await page.click('.card[data-id="1"] [data-action="add"]');
    await page.click('.card[data-id="4"] [data-action="add"]');
    expect((await page.textContent('#cart-count')) === '3', 'лічильник ≠ 3');
  });

  await check('TC-09', 'Неможливість додати відсутній товар', vp.name, async () => {
    expect(await page.locator('.card[data-id="3"] [data-action="add"]').isDisabled(), 'кнопка активна');
  });

  await check('TC-10', 'Розрахунок суми та зміна кількості', vp.name, async () => {
    await page.click('#cart-toggle');
    const total1 = Number((await page.textContent('#cart-total')).replace(/\D/g, ''));
    expect(total1 === 1299 * 2 + 399, `сума ${total1}`);
    await page.click('.cart-line[data-id="4"] [data-action="inc"]');
    const total2 = Number((await page.textContent('#cart-total')).replace(/\D/g, ''));
    expect(total2 === 1299 * 2 + 399 * 2, `сума після зміни ${total2}`);
    await page.click('.cart-line[data-id="1"] [data-action="remove"]');
    expect(await page.locator('.cart-line').count() === 1, 'рядок не видалено');
  });

  await check('TC-11', 'Збереження кошика після перезавантаження', vp.name, async () => {
    await page.reload();
    expect((await page.textContent('#cart-count')) === '2', 'кошик не відновлено');
  });

  await check('TC-12', 'Валідація форми замовлення', vp.name, async () => {
    await page.click('#cart-toggle');
    await page.fill('#checkout-form [name="name"]', 'Олена');
    await page.fill('#checkout-form [name="phone"]', '12345');
    await page.click('#checkout-form [type="submit"]');
    expect(await page.locator('.cart-line').count() === 1, 'замовлення прийнято з некоректним телефоном');
    await page.fill('#checkout-form [name="phone"]', '+380501234567');
    await page.click('#checkout-form [type="submit"]');
    expect((await page.textContent('#checkout-message')).includes('Олена'), 'немає підтвердження');
    expect(await page.locator('#cart-count').isHidden(), 'кошик не очищено');
    await page.click('#cart-close');
  });

  await check('TC-13', 'Відсутність помилок JavaScript', vp.name, async () => {
    expect(errors.length === 0, errors.join('; '));
  });

  await context.close();
}

await browser.close();
server.close();

const passed = results.filter((r) => r.status === 'passed').length;
await mkdir(join(root, 'test-results'), { recursive: true });
await writeFile(join(root, 'test-results', 'e2e.json'), JSON.stringify({ passed, total: results.length, results }, null, 2));
for (const r of results) console.log(`${r.status === 'passed' ? '✔' : '✖'} ${r.id} [${r.viewport}] ${r.title}${r.error ? ' — ' + r.error : ''}`);
console.log(`\nПройдено ${passed} з ${results.length}`);
process.exit(passed === results.length ? 0 : 1);
