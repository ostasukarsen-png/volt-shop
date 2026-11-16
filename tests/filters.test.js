import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../js/data.js';
import {
  applyFilters, createDefaultState, discountPercent, getBrands, getPriceBounds, sortProducts
} from '../js/filters.js';

const state = (patch) => ({ ...createDefaultState(), ...patch });

test('без фільтрів повертається весь каталог', () => {
  assert.equal(applyFilters(PRODUCTS, state({})).length, PRODUCTS.length);
});

test('фільтр за категорією', () => {
  const list = applyFilters(PRODUCTS, state({ categories: ['mice'] }));
  assert.ok(list.length > 0);
  assert.ok(list.every((p) => p.category === 'mice'));
});

test('фільтр за кількома категоріями об’єднує результати', () => {
  const list = applyFilters(PRODUCTS, state({ categories: ['mice', 'keyboards'] }));
  const expected = PRODUCTS.filter((p) => ['mice', 'keyboards'].includes(p.category)).length;
  assert.equal(list.length, expected);
});

test('фільтр за діапазоном цін включає межі', () => {
  const list = applyFilters(PRODUCTS, state({ minPrice: 399, maxPrice: 699 }));
  assert.ok(list.every((p) => p.price >= 399 && p.price <= 699));
  assert.ok(list.some((p) => p.price === 399));
  assert.ok(list.some((p) => p.price === 699));
});

test('фільтр «лише в наявності»', () => {
  const list = applyFilters(PRODUCTS, state({ onlyInStock: true }));
  assert.ok(list.every((p) => p.inStock));
});

test('пошук не залежить від регістру', () => {
  const list = applyFilters(PRODUCTS, state({ query: '  ПАВЕРБАНК ' }));
  assert.ok(list.length > 0);
  assert.ok(list.every((p) => p.category === 'powerbanks'));
});

test('комбінація умов звужує результат', () => {
  const list = applyFilters(PRODUCTS, state({ brands: ['Sonora'], categories: ['speakers'], maxPrice: 2000 }));
  assert.deepEqual(list.map((p) => p.id), [16]);
});

test('порожній результат за неможливих умов', () => {
  assert.equal(applyFilters(PRODUCTS, state({ minPrice: 100000 })).length, 0);
});

test('сортування за зростанням і спаданням ціни', () => {
  const asc = sortProducts(PRODUCTS, 'price-asc').map((p) => p.price);
  const desc = sortProducts(PRODUCTS, 'price-desc').map((p) => p.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
});

test('сортування не змінює вхідний масив', () => {
  const before = PRODUCTS.map((p) => p.id);
  sortProducts(PRODUCTS, 'price-desc');
  assert.deepEqual(PRODUCTS.map((p) => p.id), before);
});

test('межі цін і перелік брендів', () => {
  assert.deepEqual(getPriceBounds(PRODUCTS), { min: 349, max: 3299 });
  assert.deepEqual(getPriceBounds([]), { min: 0, max: 0 });
  assert.deepEqual(getBrands(PRODUCTS), ['Ampero', 'Kliq', 'Sonora', 'Tono', 'Volta']);
});

test('відсоток знижки', () => {
  assert.equal(discountPercent({ price: 1299, oldPrice: 1599 }), 19);
  assert.equal(discountPercent({ price: 500, oldPrice: null }), 0);
  assert.equal(discountPercent({ price: 500, oldPrice: 400 }), 0);
});
