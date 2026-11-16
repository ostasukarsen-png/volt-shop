/**
 * Фільтрація та сортування каталогу.
 * Функції чисті: не змінюють вхідний масив і не звертаються до DOM,
 * тому їх можна перевіряти модульними тестами.
 */

/** Початковий стан фільтрів. */
export function createDefaultState() {
  return {
    query: '',
    categories: [],
    brands: [],
    minPrice: null,
    maxPrice: null,
    onlyInStock: false,
    sort: 'popular'
  };
}

/** Повертає мінімальну та максимальну ціну серед товарів. */
export function getPriceBounds(products) {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** Повертає відсортований список брендів без повторень. */
export function getBrands(products) {
  return [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));
}

/** Перевіряє, чи задовольняє товар усім умовам фільтра. */
export function matchesFilters(product, state) {
  const query = state.query.trim().toLowerCase();
  if (query && !product.title.toLowerCase().includes(query)) return false;
  if (state.categories.length > 0 && !state.categories.includes(product.category)) return false;
  if (state.brands.length > 0 && !state.brands.includes(product.brand)) return false;
  if (state.minPrice !== null && product.price < state.minPrice) return false;
  if (state.maxPrice !== null && product.price > state.maxPrice) return false;
  if (state.onlyInStock && !product.inStock) return false;
  return true;
}

const comparators = {
  popular: (a, b) => b.rating - a.rating || a.id - b.id,
  'price-asc': (a, b) => a.price - b.price || a.id - b.id,
  'price-desc': (a, b) => b.price - a.price || a.id - b.id,
  name: (a, b) => a.title.localeCompare(b.title, 'uk')
};

/** Сортує копію списку відповідно до режиму. */
export function sortProducts(products, mode) {
  const compare = comparators[mode] || comparators.popular;
  return [...products].sort(compare);
}

/** Застосовує фільтри й сортування до каталогу. */
export function applyFilters(products, state) {
  return sortProducts(products.filter((p) => matchesFilters(p, state)), state.sort);
}

/** Відсоток знижки відносно старої ціни, округлений до цілого. */
export function discountPercent(product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}
