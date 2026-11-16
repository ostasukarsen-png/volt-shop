import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Cart, MAX_QUANTITY } from '../js/cart.js';
import { PRODUCTS } from '../js/data.js';

/** Замінник localStorage для середовища Node.js. */
class MemoryStorage {
  constructor(initial = {}) { this.data = { ...initial }; }
  getItem(k) { return k in this.data ? this.data[k] : null; }
  setItem(k, v) { this.data[k] = String(v); }
}

test('додавання товару та збільшення кількості', () => {
  const cart = new Cart(new MemoryStorage());
  cart.add(1);
  cart.add(1, 2);
  cart.add(4);
  assert.equal(cart.lines.length, 2);
  assert.equal(cart.count(), 4);
});

test('сума замовлення дорівнює сумі добутків ціни на кількість', () => {
  const cart = new Cart(new MemoryStorage());
  cart.add(1, 2); // 1299 × 2
  cart.add(4, 3); // 399 × 3
  assert.equal(cart.total(PRODUCTS), 1299 * 2 + 399 * 3);
});

test('зміна кількості та видалення при нульовій кількості', () => {
  const cart = new Cart(new MemoryStorage());
  cart.add(7);
  cart.setQuantity(7, 5);
  assert.equal(cart.count(), 5);
  cart.setQuantity(7, 0);
  assert.equal(cart.lines.length, 0);
});

test('кількість обмежена максимумом', () => {
  const cart = new Cart(new MemoryStorage());
  cart.add(2, 150);
  assert.equal(cart.count(), MAX_QUANTITY);
});

test('вміст зберігається між екземплярами', () => {
  const storage = new MemoryStorage();
  const first = new Cart(storage);
  first.add(10, 2);
  const second = new Cart(storage);
  assert.equal(second.count(), 2);
});

test('пошкоджені дані у сховищі не порушують роботу', () => {
  const cart = new Cart(new MemoryStorage({ 'volt-cart': '{не json' }));
  assert.equal(cart.count(), 0);
  const cart2 = new Cart(new MemoryStorage({ 'volt-cart': '[{"id":1,"qty":-3},{"id":"x","qty":1},{"id":5,"qty":2}]' }));
  assert.equal(cart2.count(), 2);
});

test('товари, відсутні в каталозі, не враховуються в сумі', () => {
  const cart = new Cart(new MemoryStorage());
  cart.add(999);
  cart.add(4);
  assert.equal(cart.detailed(PRODUCTS).length, 1);
  assert.equal(cart.total(PRODUCTS), 399);
});

test('кошик працює без сховища', () => {
  const cart = new Cart(null);
  cart.add(3);
  cart.clear();
  assert.equal(cart.count(), 0);
});

test('підписники отримують сповіщення про зміни', () => {
  const cart = new Cart(new MemoryStorage());
  let calls = 0;
  cart.onChange(() => { calls += 1; });
  cart.add(1);
  cart.remove(1);
  assert.equal(calls, 2);
});
