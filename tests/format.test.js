import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pluralize, escapeHtml } from '../js/format.js';

test('узгодження іменника з числівником', () => {
  const f = (n) => pluralize(n, 'товар', 'товари', 'товарів');
  assert.equal(f(1), 'товар');
  assert.equal(f(3), 'товари');
  assert.equal(f(5), 'товарів');
  assert.equal(f(11), 'товарів');
  assert.equal(f(21), 'товар');
  assert.equal(f(14), 'товарів');
  assert.equal(f(0), 'товарів');
});

test('екранування HTML', () => {
  assert.equal(escapeHtml('<b>"А"&\'Б\'</b>'), '&lt;b&gt;&quot;А&quot;&amp;&#39;Б&#39;&lt;/b&gt;');
});
