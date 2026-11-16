/**
 * Кошик покупця. Вміст зберігається у Web Storage (localStorage),
 * тому не втрачається після перезавантаження сторінки.
 */
export const STORAGE_KEY = 'volt-cart';
export const MAX_QUANTITY = 99;

export class Cart {
  /**
   * @param {Storage|null} storage сховище з інтерфейсом getItem/setItem
   * @param {string} key ключ запису
   */
  constructor(storage, key = STORAGE_KEY) {
    this.storage = storage;
    this.key = key;
    this.listeners = [];
    this.lines = this.load();
  }

  load() {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((l) => Number.isInteger(l.id) && Number.isInteger(l.qty) && l.qty > 0)
        : [];
    } catch {
      return [];
    }
  }

  save() {
    if (this.storage) {
      try {
        this.storage.setItem(this.key, JSON.stringify(this.lines));
      } catch {
        /* сховище недоступне або переповнене: кошик працює в пам'яті */
      }
    }
    this.listeners.forEach((fn) => fn(this));
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  add(id, qty = 1) {
    const line = this.lines.find((l) => l.id === id);
    if (line) {
      line.qty = Math.min(line.qty + qty, MAX_QUANTITY);
    } else {
      this.lines.push({ id, qty: Math.min(qty, MAX_QUANTITY) });
    }
    this.save();
  }

  setQuantity(id, qty) {
    if (qty <= 0) {
      this.remove(id);
      return;
    }
    const line = this.lines.find((l) => l.id === id);
    if (line) {
      line.qty = Math.min(qty, MAX_QUANTITY);
      this.save();
    }
  }

  remove(id) {
    this.lines = this.lines.filter((l) => l.id !== id);
    this.save();
  }

  clear() {
    this.lines = [];
    this.save();
  }

  /** Загальна кількість одиниць товару. */
  count() {
    return this.lines.reduce((sum, l) => sum + l.qty, 0);
  }

  /** Рядки кошика, доповнені даними товару; відсутні в каталозі товари відкидаються. */
  detailed(products) {
    return this.lines
      .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) }))
      .filter((l) => l.product);
  }

  /** Сума замовлення: S = Σ p_i · q_i. */
  total(products) {
    return this.detailed(products).reduce((sum, l) => sum + l.product.price * l.qty, 0);
  }
}
