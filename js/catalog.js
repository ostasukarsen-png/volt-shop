import { CATEGORIES } from './data.js';
import { discountPercent } from './filters.js';
import { formatPrice, escapeHtml } from './format.js';

const categoryName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

function renderStars(rating) {
  const full = Math.round(rating);
  return `<span class="rating" aria-label="Рейтинг ${rating} з 5">${'★'.repeat(full)}${'☆'.repeat(5 - full)}<span class="rating__value">${rating.toFixed(1)}</span></span>`;
}

function renderPrice(product) {
  const discount = discountPercent(product);
  const old = discount > 0 ? `<s class="price__old">${formatPrice(product.oldPrice)}</s>` : '';
  return `<div class="price">${old}<span class="price__current${discount > 0 ? ' price__current--sale' : ''}">${formatPrice(product.price)}</span></div>`;
}

/**
 * Розмітка картки товару в сітці каталогу.
 * Зображення перших чотирьох карток завантажуються одразу, решта — відкладено.
 */
export function productCardHtml(product, index = 0) {
  const discount = discountPercent(product);
  const badge = discount > 0 ? `<span class="badge badge--sale">−${discount}%</span>` : '';
  const stock = product.inStock
    ? '<span class="stock stock--in">В наявності</span>'
    : '<span class="stock stock--out">Немає в наявності</span>';
  return `
    <article class="card" data-id="${product.id}">
      <button class="card__media" type="button" data-action="details">
        ${badge}
        <img src="${product.image}" alt="${escapeHtml(product.title)}" width="240" height="180" loading="${index < 4 ? 'eager' : 'lazy'}">
      </button>
      <div class="card__body">
        <p class="card__category">${categoryName(product.category)}</p>
        <h2 class="card__title"><button type="button" class="link-button" data-action="details">${escapeHtml(product.title)}</button></h2>
        ${renderStars(product.rating)}
        ${stock}
        <div class="card__footer">
          ${renderPrice(product)}
          <button class="btn btn--primary" type="button" data-action="add" ${product.inStock ? '' : 'disabled'}>
            ${product.inStock ? 'У кошик' : 'Очікується'}
          </button>
        </div>
      </div>
    </article>`;
}

/** Виводить список товарів у контейнер або повідомлення про порожній результат. */
export function renderCatalog(container, products) {
  if (products.length === 0) {
    container.innerHTML = '<p class="empty">За обраними умовами товарів не знайдено. Змініть або скиньте фільтри.</p>';
    return;
  }
  container.innerHTML = products.map((p, i) => productCardHtml(p, i)).join('');
}

/** Розмітка вмісту діалогового вікна з детальною карткою товару. */
export function productDetailsHtml(product) {
  const specs = Object.entries(product.specs)
    .map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join('');
  return `
    <div class="details" data-id="${product.id}">
      <img class="details__image" src="${product.image}" alt="${escapeHtml(product.title)}" width="360" height="270">
      <div class="details__info">
        <p class="card__category">${categoryName(product.category)} · ${escapeHtml(product.brand)}</p>
        <h2 id="details-title" class="details__title">${escapeHtml(product.title)}</h2>
        ${renderStars(product.rating)}
        <p>${escapeHtml(product.description)}</p>
        <table class="specs"><tbody>${specs}</tbody></table>
        ${renderPrice(product)}
        <button class="btn btn--primary" type="button" data-action="add" ${product.inStock ? '' : 'disabled'}>
          ${product.inStock ? 'Додати в кошик' : 'Немає в наявності'}
        </button>
      </div>
    </div>`;
}
