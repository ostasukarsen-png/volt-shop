/**
 * Каталог товарів інтернет-магазину «Вольт».
 * Ціни вказано в гривнях. Поле oldPrice заповнюється лише для товарів зі знижкою.
 */
export const CATEGORIES = [
  { id: 'headphones', name: 'Навушники' },
  { id: 'chargers', name: 'Зарядні пристрої' },
  { id: 'powerbanks', name: 'Павербанки' },
  { id: 'mice', name: 'Миші' },
  { id: 'keyboards', name: 'Клавіатури' },
  { id: 'speakers', name: 'Колонки' }
];

export const PRODUCTS = [
  { id: 1, title: 'Навушники Sonora Air S1', category: 'headphones', brand: 'Sonora', price: 1299, oldPrice: 1599, rating: 4.6, inStock: true, image: 'img/headphones-1.svg',
    description: 'Бездротові внутрішньоканальні навушники з кейсом для заряджання та підтримкою Bluetooth 5.3.', specs: { 'Тип': 'TWS', 'Час роботи': 'до 6 год', 'Захист': 'IPX4' } },
  { id: 2, title: 'Навушники Sonora Studio M2', category: 'headphones', brand: 'Sonora', price: 2899, oldPrice: null, rating: 4.8, inStock: true, image: 'img/headphones-2.svg',
    description: 'Повнорозмірні навушники з активним шумозаглушенням і м’якими амбушурами.', specs: { 'Тип': 'накладні', 'Час роботи': 'до 30 год', 'Шумозаглушення': 'активне' } },
  { id: 3, title: 'Навушники Tono Sport', category: 'headphones', brand: 'Tono', price: 749, oldPrice: null, rating: 4.1, inStock: false, image: 'img/headphones-3.svg',
    description: 'Спортивні навушники з дужками, що надійно тримаються під час бігу.', specs: { 'Тип': 'вкладиші', 'Час роботи': 'до 8 год', 'Захист': 'IPX5' } },
  { id: 4, title: 'Зарядний пристрій Ampero 20W', category: 'chargers', brand: 'Ampero', price: 399, oldPrice: null, rating: 4.5, inStock: true, image: 'img/chargers-1.svg',
    description: 'Компактний мережевий зарядний пристрій з портом USB-C і підтримкою Power Delivery.', specs: { 'Потужність': '20 Вт', 'Порти': '1 × USB-C', 'Стандарт': 'PD 3.0' } },
  { id: 5, title: 'Зарядний пристрій Ampero 65W GaN', category: 'chargers', brand: 'Ampero', price: 1149, oldPrice: 1349, rating: 4.7, inStock: true, image: 'img/chargers-2.svg',
    description: 'Зарядний пристрій на нітриді галію для ноутбука й смартфона одночасно.', specs: { 'Потужність': '65 Вт', 'Порти': '2 × USB-C, 1 × USB-A', 'Стандарт': 'PD 3.0' } },
  { id: 6, title: 'Бездротова зарядка Volta Pad', category: 'chargers', brand: 'Volta', price: 549, oldPrice: null, rating: 4.0, inStock: true, image: 'img/chargers-3.svg',
    description: 'Індукційна зарядна панель для смартфонів і навушників із підтримкою Qi.', specs: { 'Потужність': '15 Вт', 'Стандарт': 'Qi', 'Кабель': 'USB-C, 1 м' } },
  { id: 7, title: 'Павербанк Volta 10000', category: 'powerbanks', brand: 'Volta', price: 699, oldPrice: null, rating: 4.4, inStock: true, image: 'img/powerbanks-1.svg',
    description: 'Легкий зовнішній акумулятор для щоденного використання.', specs: { 'Ємність': '10000 мА·год', 'Вихід': '22,5 Вт', 'Маса': '210 г' } },
  { id: 8, title: 'Павербанк Volta 20000 PD', category: 'powerbanks', brand: 'Volta', price: 1249, oldPrice: 1499, rating: 4.6, inStock: true, image: 'img/powerbanks-2.svg',
    description: 'Акумулятор підвищеної ємності з дисплеєм рівня заряду.', specs: { 'Ємність': '20000 мА·год', 'Вихід': '45 Вт', 'Маса': '390 г' } },
  { id: 9, title: 'Павербанк Ampero Mini', category: 'powerbanks', brand: 'Ampero', price: 489, oldPrice: null, rating: 3.9, inStock: false, image: 'img/powerbanks-3.svg',
    description: 'Мініатюрний акумулятор із вбудованим роз’ємом USB-C.', specs: { 'Ємність': '5000 мА·год', 'Вихід': '12 Вт', 'Маса': '105 г' } },
  { id: 10, title: 'Миша Kliq Office', category: 'mice', brand: 'Kliq', price: 349, oldPrice: null, rating: 4.2, inStock: true, image: 'img/mice-1.svg',
    description: 'Бездротова миша з тихими кнопками для роботи в офісі.', specs: { 'Підключення': '2,4 ГГц', 'Роздільність': '1600 DPI', 'Живлення': '1 × AA' } },
  { id: 11, title: 'Миша Kliq Pro Gaming', category: 'mice', brand: 'Kliq', price: 1499, oldPrice: 1799, rating: 4.7, inStock: true, image: 'img/mice-2.svg',
    description: 'Ігрова миша з оптичним сенсором і програмованими кнопками.', specs: { 'Підключення': 'USB / 2,4 ГГц', 'Роздільність': '26000 DPI', 'Маса': '63 г' } },
  { id: 12, title: 'Миша Tono Travel', category: 'mice', brand: 'Tono', price: 429, oldPrice: null, rating: 4.0, inStock: true, image: 'img/mice-3.svg',
    description: 'Компактна миша для ноутбука з підключенням Bluetooth.', specs: { 'Підключення': 'Bluetooth 5.0', 'Роздільність': '1200 DPI', 'Живлення': 'акумулятор' } },
  { id: 13, title: 'Клавіатура Kliq K87', category: 'keyboards', brand: 'Kliq', price: 1899, oldPrice: null, rating: 4.5, inStock: true, image: 'img/keyboards-1.svg',
    description: 'Механічна клавіатура без цифрового блоку з українською розкладкою.', specs: { 'Формат': 'TKL', 'Перемикачі': 'лінійні', 'Підсвічування': 'RGB' } },
  { id: 14, title: 'Клавіатура Kliq Slim', category: 'keyboards', brand: 'Kliq', price: 999, oldPrice: 1199, rating: 4.3, inStock: true, image: 'img/keyboards-2.svg',
    description: 'Тонка бездротова клавіатура з ножичним механізмом клавіш.', specs: { 'Формат': 'повний', 'Підключення': 'Bluetooth', 'Живлення': 'акумулятор' } },
  { id: 15, title: 'Клавіатура Tono Basic', category: 'keyboards', brand: 'Tono', price: 459, oldPrice: null, rating: 3.8, inStock: false, image: 'img/keyboards-3.svg',
    description: 'Дротова мембранна клавіатура з вологостійким корпусом.', specs: { 'Формат': 'повний', 'Підключення': 'USB', 'Кабель': '1,5 м' } },
  { id: 16, title: 'Колонка Sonora Go', category: 'speakers', brand: 'Sonora', price: 1099, oldPrice: null, rating: 4.4, inStock: true, image: 'img/speakers-1.svg',
    description: 'Портативна колонка з водозахищеним корпусом і ремінцем.', specs: { 'Потужність': '10 Вт', 'Час роботи': 'до 12 год', 'Захист': 'IP67' } },
  { id: 17, title: 'Колонка Sonora Boom', category: 'speakers', brand: 'Sonora', price: 3299, oldPrice: 3799, rating: 4.9, inStock: true, image: 'img/speakers-2.svg',
    description: 'Потужна колонка зі стереозвуком для вечірок на природі.', specs: { 'Потужність': '40 Вт', 'Час роботи': 'до 20 год', 'Захист': 'IPX6' } },
  { id: 18, title: 'Колонка Tono Desk', category: 'speakers', brand: 'Tono', price: 799, oldPrice: null, rating: 4.1, inStock: true, image: 'img/speakers-3.svg',
    description: 'Настільна акустика 2.0 для комп’ютера з живленням від USB.', specs: { 'Потужність': '2 × 3 Вт', 'Підключення': 'AUX, USB', 'Регулятор': 'на кабелі' } }
];
