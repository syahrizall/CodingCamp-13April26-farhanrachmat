// ===========================
// Constants & Config
// ===========================
const STORAGE_KEY        = 'expense_tracker_data';
const CUSTOM_CATS_KEY    = 'expense_tracker_custom_cats';
const THEME_KEY          = 'expense_tracker_theme';

const DEFAULT_CATEGORY_COLORS = {
  Food:      '#6c63ff',
  Transport: '#f9a825',
  Fun:       '#e91e63',
  Health:    '#00bcd4',
  Shopping:  '#4caf50',
  Other:     '#9e9e9e',
};

const DEFAULT_CATEGORY_LABELS = {
  Food:      '🍔 Food',
  Transport: '🚗 Transport',
  Fun:       '🎮 Fun',
  Health:    '💊 Health',
  Shopping:  '🛍️ Shopping',
  Other:     '📦 Other',
};

// Palette for auto-assigning colors to custom categories
const CUSTOM_COLOR_PALETTE = [
  '#ff7043', '#ab47bc', '#26a69a', '#ef5350',
  '#42a5f5', '#d4e157', '#ff7043', '#8d6e63',
  '#78909c', '#ec407a',
];

// ===========================
// State
// ===========================
let transactions   = loadFromStorage(STORAGE_KEY, []);
let customCategories = loadFromStorage(CUSTOM_CATS_KEY, []); // [{ name, emoji, color }]
let currentSort    = 'date'; // 'date' | 'amount-desc' | 'amount-asc' | 'category'

// ===========================
// DOM References
// ===========================
const form              = document.getElementById('transaction-form');
const nameInput         = document.getElementById('name');
const amountInput       = document.getElementById('amount');
const categorySelect    = document.getElementById('category');
const totalEl           = document.getElementById('total');
const listEl            = document.getElementById('transaction-list');
const clearAllBtn       = document.getElementById('clear-all');
const chartEmpty        = document.getElementById('chart-empty');
const chartCanvas       = document.getElementById('chart');
const themeToggleBtn    = document.getElementById('theme-toggle');
const themeIcon         = document.getElementById('theme-icon');
const customCatNameInput  = document.getElementById('custom-cat-name');
const customCatEmojiInput = document.getElementById('custom-cat-emoji');
const addCategoryBtn    = document.getElementById('add-category-btn');
const customCatList     = document.getElementById('custom-category-list');
const sortBtns          = document.querySelectorAll('.sort-btn');

// ===========================
// Theme
// ===========================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  // Update chart text color for dark mode
  const textColor = theme === 'dark' ? '#e8eaf0' : '#2d2d2d';
  chart.options.plugins.legend.labels.color = textColor;
  chart.update();
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

themeToggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ===========================
// Chart Setup
// ===========================
let chart = new Chart(chartCanvas.getContext('2d'), {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2,
      borderColor: 'transparent',
      hoverOffset: 6,
    }]
  },
  options: {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 14,
          font: { size: 12 },
          usePointStyle: true,
          color: '#2d2d2d',
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Rp${ctx.parsed.toLocaleString('id-ID')}`,
        }
      }
    }
  }
});

// ===========================
// Category Helpers
// ===========================
function getCategoryLabel(key) {
  if (DEFAULT_CATEGORY_LABELS[key]) return DEFAULT_CATEGORY_LABELS[key];
  const custom = customCategories.find(c => c.name === key);
  return custom ? `${custom.emoji} ${custom.name}` : key;
}

function getCategoryColor(key) {
  if (DEFAULT_CATEGORY_COLORS[key]) return DEFAULT_CATEGORY_COLORS[key];
  const custom = customCategories.find(c => c.name === key);
  return custom ? custom.color : '#9e9e9e';
}

function rebuildCategorySelect() {
  // Keep the placeholder option, remove everything else
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }

  // Default categories
  const defaults = [
    { value: 'Food',      label: '🍔 Food' },
    { value: 'Transport', label: '🚗 Transport' },
    { value: 'Fun',       label: '🎮 Fun' },
    { value: 'Health',    label: '💊 Health' },
    { value: 'Shopping',  label: '🛍️ Shopping' },
    { value: 'Other',     label: '📦 Other' },
  ];

  defaults.forEach(({ value, label }) => {
    const opt = new Option(label, value);
    categorySelect.add(opt);
  });

  // Custom categories
  customCategories.forEach(cat => {
    const opt = new Option(`${cat.emoji} ${cat.name}`, cat.name);
    categorySelect.add(opt);
  });
}

function renderCustomCategoryList() {
  customCatList.innerHTML = '';

  if (customCategories.length === 0) {
    const li = document.createElement('li');
    li.className = 'custom-cat-empty';
    li.textContent = 'No custom categories yet.';
    customCatList.appendChild(li);
    return;
  }

  customCategories.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'custom-cat-tag';
    li.innerHTML = `
      <span>${cat.emoji} ${escapeHtml(cat.name)}</span>
      <button aria-label="Remove ${escapeHtml(cat.name)}" data-name="${escapeHtml(cat.name)}">✕</button>
    `;
    li.querySelector('button').addEventListener('click', () => {
      handleDeleteCustomCategory(cat.name);
    });
    customCatList.appendChild(li);
  });
}

// ===========================
// Custom Category Handlers
// ===========================
addCategoryBtn.addEventListener('click', handleAddCustomCategory);

customCatNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); }
});

function handleAddCustomCategory() {
  const name  = customCatNameInput.value.trim();
  const emoji = customCatEmojiInput.value.trim() || '🏷️';

  if (!name) {
    showToast('Enter a category name.');
    return;
  }

  const allKeys = [
    ...Object.keys(DEFAULT_CATEGORY_LABELS),
    ...customCategories.map(c => c.name),
  ];

  if (allKeys.some(k => k.toLowerCase() === name.toLowerCase())) {
    showToast('Category already exists.');
    return;
  }

  const color = CUSTOM_COLOR_PALETTE[customCategories.length % CUSTOM_COLOR_PALETTE.length];

  customCategories.push({ name, emoji, color });
  saveToStorage(CUSTOM_CATS_KEY, customCategories);

  customCatNameInput.value  = '';
  customCatEmojiInput.value = '';

  rebuildCategorySelect();
  renderCustomCategoryList();
  showToast(`Category "${name}" added!`);
}

function handleDeleteCustomCategory(name) {
  customCategories = customCategories.filter(c => c.name !== name);
  saveToStorage(CUSTOM_CATS_KEY, customCategories);
  rebuildCategorySelect();
  renderCustomCategoryList();
  renderChart(); // chart colors may change
  showToast(`Category removed.`);
}

// ===========================
// Sort
// ===========================
sortBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sortBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    renderList();
  });
});

function getSortedTransactions() {
  const copy = [...transactions];
  switch (currentSort) {
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    case 'date':
    default:
      return copy; // already stored newest-first
  }
}

// ===========================
// Transaction Handlers
// ===========================
form.addEventListener('submit', handleAddTransaction);
clearAllBtn.addEventListener('click', handleClearAll);

function handleAddTransaction(e) {
  e.preventDefault();

  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if (!name || !amount || amount <= 0 || !category) {
    showToast('Please fill in all fields correctly.');
    return;
  }

  const transaction = {
    id: Date.now(),
    name,
    amount,
    category,
    date: new Date().toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    }),
  };

  transactions.unshift(transaction);
  saveToStorage(STORAGE_KEY, transactions);
  updateUI();
  form.reset();
  showToast('Transaction added!');
}

function handleDeleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage(STORAGE_KEY, transactions);
  updateUI();
  showToast('Transaction removed.');
}

function handleClearAll() {
  if (transactions.length === 0) return;
  if (!confirm('Clear all transactions? This cannot be undone.')) return;
  transactions = [];
  saveToStorage(STORAGE_KEY, transactions);
  updateUI();
  showToast('All transactions cleared.');
}

// ===========================
// UI Update
// ===========================
function updateUI() {
  renderTotal();
  renderList();
  renderChart();
}

function renderTotal() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalEl.textContent = total.toLocaleString('id-ID');
}

function renderList() {
  listEl.innerHTML = '';
  const sorted = getSortedTransactions();

  if (sorted.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = 'No transactions yet.';
    listEl.appendChild(li);
    return;
  }

  sorted.forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-name">${escapeHtml(t.name)}</div>
        <div class="transaction-meta">${escapeHtml(getCategoryLabel(t.category))} &bull; ${t.date}</div>
      </div>
      <span class="transaction-amount">Rp${t.amount.toLocaleString('id-ID')}</span>
      <button class="transaction-delete" aria-label="Delete transaction" data-id="${t.id}">✕</button>
    `;
    li.querySelector('.transaction-delete').addEventListener('click', () => {
      handleDeleteTransaction(t.id);
    });
    listEl.appendChild(li);
  });
}

function renderChart() {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const categories = Object.keys(totals);
  const hasData = categories.length > 0;

  chartCanvas.style.display = hasData ? 'block' : 'none';
  chartEmpty.classList.toggle('hidden', hasData);

  chart.data.labels = categories.map(c => getCategoryLabel(c));
  chart.data.datasets[0].data = categories.map(c => totals[c]);
  chart.data.datasets[0].backgroundColor = categories.map(c => getCategoryColor(c));
  chart.update();
}

// ===========================
// LocalStorage
// ===========================
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ===========================
// Toast Notification
// ===========================
let toastTimer = null;

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===========================
// Utility
// ===========================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ===========================
// Init
// ===========================
initTheme();
rebuildCategorySelect();
renderCustomCategoryList();
updateUI();
