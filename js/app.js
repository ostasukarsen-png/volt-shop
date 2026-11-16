import { CATEGORIES, PRODUCTS } from './data.js';
import { applyFilters, createDefaultState, getBrands, getPriceBounds } from './filters.js';
import { renderCatalog, productDetailsHtml } from './catalog.js';
import { Cart } from './cart.js';
import { formatPrice, pluralize, escapeHtml } from './format.js';

const state = createDefaultState();
const cart = new Cart(getStorage());

const el = {
  grid: document.getElementById('catalog-grid'),
  count: document.getElementById('result-count'),
  search: document.getElementById('search'),
  sort: document.getElementById('sort'),
  categoryList: document.getElementById('filter-categories'),
  brandList: document.getElementById('filter-brands'),
  minPrice: document.getElementById('price-min'),
  maxPrice: document.getElementById('price-max'),
  inStock: document.getElementById('in-stock'),
  reset: document.getElementById('reset-filters'),
  filtersPanel: document.getElementById('filters'),
  filtersToggle: document.getElementById('filters-toggle'),
  filtersClose: document.getElementById('filters-close'),
  cartToggle: document.getElementById('cart-toggle'),
  cartBadge: document.getElementById('cart-count'),
  cartPanel: document.getElementById('cart'),
  cartClose: document.getElementById('cart-close'),
  cartItems: document.getElementById('cart-items'),
  cartTotal: document.getElementById('cart-total'),
  cartClear: document.getElementById('cart-clear'),
  checkout: document.getElementById('checkout'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutMessage: document.getElementById('checkout-message'),
  overlay: document.getElementById('overlay'),
  dialog: document.getElementById('product-dialog'),
  dialogBody: document.getElementById('product-dialog-body'),
  toast: document.getElementById('toast')
};

function getStorage() {
  try {
    const probe = '__volt_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/* ---------- Фільтри ---------- */

function checkboxHtml(name, value, label) {
  return `<label class="check"><input type="checkbox" name="${name}" value="${escapeHtml(value)}"> <span>${escapeHtml(label)}</span></label>`;
}

function buildFilterControls() {
  el.categoryList.innerHTML = CATEGORIES.map((c) => checkboxHtml('category', c.id, c.name)).join('');
  el.brandList.innerHTML = getBrands(PRODUCTS).map((b) => checkboxHtml('brand', b, b)).join('');
  const { min, max } = getPriceBounds(PRODUCTS);
  el.minPrice.placeholder = String(min);
  el.maxPrice.placeholder = String(max);
}

function readPrice(input) {
  const value = Number.parseInt(input.value, 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function readFilters() {
  state.query = el.search.value;
  state.sort = el.sort.value;
  state.categories = [...el.categoryList.querySelectorAll('input:checked')].map((i) => i.value);
  state.brands = [...el.brandList.querySelectorAll('input:checked')].map((i) => i.value);
  state.minPrice = readPrice(el.minPrice);
  state.maxPrice = readPrice(el.maxPrice);
  state.onlyInStock = el.inStock.checked;
}

function updateCatalog() {
  readFilters();
  const list = applyFilters(PRODUCTS, state);
  renderCatalog(el.grid, list);
  el.count.textContent = `Знайдено ${list.length} ${pluralize(list.length, 'товар', 'товари', 'товарів')}`;
}

function resetFilters() {
  document.querySelectorAll('#filters input[type="checkbox"]').forEach((i) => { i.checked = false; });
  el.minPrice.value = '';
  el.maxPrice.value = '';
  el.search.value = '';
  el.sort.value = 'popular';
  updateCatalog();
}

/* ---------- Панелі та діалоги ---------- */

function openPanel(panel, toggle) {
  panel.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  el.overlay.hidden = false;
  document.body.classList.add('no-scroll');
}

function closePanels() {
  [el.cartPanel, el.filtersPanel].forEach((p) => p.classList.remove('is-open'));
  [el.cartToggle, el.filtersToggle].forEach((t) => t.setAttribute('aria-expanded', 'false'));
  el.overlay.hidden = true;
  document.body.classList.remove('no-scroll');
}

function showProduct(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  el.dialogBody.innerHTML = productDetailsHtml(product);
  el.dialog.showModal();
}

let toastTimer = null;
function showToast(text) {
  el.toast.textContent = text;
  el.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2000);
}

/* ---------- Кошик ---------- */

function renderCart() {
  const lines = cart.detailed(PRODUCTS);
  const count = cart.count();
  el.cartBadge.textContent = String(count);
  el.cartBadge.hidden = count === 0;

  if (lines.length === 0) {
    el.cartItems.innerHTML = '<li class="cart__empty">Кошик порожній</li>';
  } else {
    el.cartItems.innerHTML = lines.map(({ product, qty }) => `
      <li class="cart-line" data-id="${product.id}">
        <img src="${product.image}" alt="" width="64" height="48">
        <div class="cart-line__info">
          <p class="cart-line__title">${escapeHtml(product.title)}</p>
          <p class="cart-line__price">${formatPrice(product.price)} × ${qty} = <b>${formatPrice(product.price * qty)}</b></p>
          <div class="qty">
            <button type="button" class="qty__btn" data-action="dec" aria-label="Зменшити кількість">−</button>
            <input class="qty__input" type="number" min="1" max="99" value="${qty}" aria-label="Кількість">
            <button type="button" class="qty__btn" data-action="inc" aria-label="Збільшити кількість">+</button>
          </div>
        </div>
        <button type="button" class="cart-line__remove" data-action="remove" aria-label="Видалити товар">✕</button>
      </li>`).join('');
  }
  el.cartTotal.textContent = formatPrice(cart.total(PRODUCTS));
  el.cartClear.disabled = lines.length === 0;
  el.checkout.hidden = lines.length === 0;
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product || !product.inStock) return;
  cart.add(id);
  showToast(`«${product.title}» додано до кошика`);
}

function handleCheckout(event) {
  event.preventDefault();
  const form = el.checkoutForm;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const name = form.elements.name.value.trim();
  const total = formatPrice(cart.total(PRODUCTS));
  cart.clear();
  form.reset();
  el.checkoutMessage.textContent = `Дякуємо, ${name}! Замовлення на суму ${total} прийнято. Менеджер зателефонує для підтвердження.`;
}

/* ---------- Події ---------- */

function bindEvents() {
  el.search.addEventListener('input', updateCatalog);
  el.sort.addEventListener('change', updateCatalog);
  el.filtersPanel.addEventListener('change', updateCatalog);
  el.minPrice.addEventListener('input', updateCatalog);
  el.maxPrice.addEventListener('input', updateCatalog);
  el.reset.addEventListener('click', resetFilters);

  el.grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.closest('.card').dataset.id);
    if (button.dataset.action === 'add') addToCart(id);
    if (button.dataset.action === 'details') showProduct(id);
  });

  el.dialog.addEventListener('click', (event) => {
    if (event.target === el.dialog || event.target.closest('[data-action="close"]')) {
      el.dialog.close();
      return;
    }
    const add = event.target.closest('[data-action="add"]');
    if (add) addToCart(Number(add.closest('.details').dataset.id));
  });

  el.cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.closest('.cart-line').dataset.id);
    const line = cart.lines.find((l) => l.id === id);
    if (button.dataset.action === 'inc') cart.setQuantity(id, line.qty + 1);
    if (button.dataset.action === 'dec') cart.setQuantity(id, line.qty - 1);
    if (button.dataset.action === 'remove') cart.remove(id);
  });

  el.cartItems.addEventListener('change', (event) => {
    if (!event.target.matches('.qty__input')) return;
    const id = Number(event.target.closest('.cart-line').dataset.id);
    const qty = Number.parseInt(event.target.value, 10);
    cart.setQuantity(id, Number.isFinite(qty) ? qty : 1);
  });

  el.cartClear.addEventListener('click', () => cart.clear());
  el.checkoutForm.addEventListener('submit', handleCheckout);

  el.cartToggle.addEventListener('click', () => {
    el.checkoutMessage.textContent = '';
    openPanel(el.cartPanel, el.cartToggle);
  });
  el.cartClose.addEventListener('click', closePanels);
  el.filtersToggle.addEventListener('click', () => openPanel(el.filtersPanel, el.filtersToggle));
  el.filtersClose.addEventListener('click', closePanels);
  el.overlay.addEventListener('click', closePanels);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanels();
  });

  cart.onChange(renderCart);
}

buildFilterControls();
bindEvents();
updateCatalog();
renderCart();
