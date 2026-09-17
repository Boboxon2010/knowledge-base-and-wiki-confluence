// Dastlabki namunaviy ma'lumotlar
const initialArticles = [
  {
    id: 1,
    title: "JavaScript Standart va Qoidalari",
    category: "Dasturlash",
    tags: ["javascript", "clean-code", "frontend"],
    content: "Loyiha bo'yicha barcha JavaScript kodi ES6+ standartida yozilishi shart. O'zgaruvchilarni e'lon qilishda const va let dan foydalaning.",
    favorite: true,
    date: "2026-09-10"
  },
  {
    id: 2,
    title: "UI/UX Ranglar Palitrasi Qo'llanmasi",
    category: "Dizayn",
    tags: ["ui", "colors", "figma"],
    content: "Asosiy rang sifatida #0052cc va qo'shimcha aksent rang sifatida va tungi rejim mosligini saqlash zarur.",
    favorite: false,
    date: "2026-09-12"
  },
  {
    id: 3,
    title: "Masofaviy Ishlash Qoidalari",
    category: "Qoidalar",
    tags: ["hr", "remote", "rules"],
    content: "Ish kuni soat 09:00 da boshlanadi. Barcha xodimlar Slack/Telegram orqali statusni 'Ishda' ga o'zgartirishi kerak.",
    favorite: false,
    date: "2026-09-15"
  }
];

// App Holati (State)
let articles = JSON.parse(localStorage.getItem('wiki_articles')) || initialArticles;
let currentCategory = 'all';
let searchQuery = '';

// DOM Elementlari
const articlesGrid = document.getElementById('articlesGrid');
const articleDetail = document.getElementById('articleDetail');
const searchInput = document.getElementById('searchInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const categoryList = document.getElementById('categoryList');
const articleModal = document.getElementById('articleModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const articleForm = document.getElementById('articleForm');

// O'qish vaqtini hisoblash (qo'shimcha funksiya)
function calculateReadTime(text) {
  const wordsPerMinute = 150;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min o'qish`;
}

// Boshlang'ich yuklash
function init() {
  renderArticles();
  updateCategoryCounts();
  setupEventListeners();
}

// Maqolalarni chizish
function renderArticles() {
  articleDetail.classList.add('hidden');
  articlesGrid.classList.remove('hidden');
  articlesGrid.innerHTML = '';

  const filtered = articles.filter(art => {
    const matchesCat = currentCategory === 'all' ? true :
                       currentCategory === 'favorites' ? art.favorite :
                       art.category === currentCategory;

    const matchesSearch = art.title.toLowerCase().includes(searchQuery) ||
                          art.content.toLowerCase().includes(searchQuery) ||
                          art.tags.some(t => t.toLowerCase().includes(searchQuery));

    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    articlesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Maqolalar topilmadi.</p>`;
    return;
  }

  filtered.forEach(art => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <div class="card-header">
          <span class="card-title">${art.title}</span>
          <button class="fav-btn" onclick="toggleFavorite(event, ${art.id})">
            ${art.favorite ? '⭐' : '☆'}
          </button>
        </div>
        <p class="card-excerpt">${art.content.substring(0, 80)}...</p>
        <div class="card-tags">
          ${art.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
      </div>
      <div class="card-footer">
        <span>⏱️ ${calculateReadTime(art.content)}</span>
        <span>📅 ${art.date}</span>
      </div>
    `;
    card.addEventListener('click', () => showArticleDetail(art.id));
    articlesGrid.appendChild(card);
  });
}

// Maqola tafsilotini ko'rsatish
function showArticleDetail(id) {
  const art = articles.find(a => a.id === id);
  if (!art) return;

  articlesGrid.classList.add('hidden');
  articleDetail.classList.remove('hidden');

  articleDetail.innerHTML = `
    <button class="btn btn-secondary back-btn" onclick="renderArticles()">← Ortga qaytish</button>
    <h2>${art.title}</h2>
    <div style="margin: 0.5rem 0 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">
      <span>Kategoriya: <b>${art.category}</b></span> | 
      <span>Sana: ${art.date}</span> | 
      <span>${calculateReadTime(art.content)}</span>
    </div>
    <div class="card-tags" style="margin-bottom: 1.5rem;">
      ${art.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
    </div>
    <hr style="border-color: var(--border-color); margin-bottom: 1.5rem;">
    <p style="line-height: 1.6; font-size: 1.05rem;">${art.content}</p>
  `;
}

// Sevimlilarga qo'shish/o'chirish
window.toggleFavorite = function(e, id) {
  e.stopPropagation();
  articles = articles.map(art => art.id === id ? { ...art, favorite: !art.favorite } : art);
  saveAndRefresh();
};

// Kategoriyalar sonini yangilash
function updateCategoryCounts() {
  document.getElementById('count-all').innerText = articles.length;
  document.getElementById('count-fav').innerText = articles.filter(a => a.favorite).length;
  document.getElementById('count-dev').innerText = articles.filter(a => a.category === 'Dasturlash').length;
  document.getElementById('count-design').innerText = articles.filter(a => a.category === 'Dizayn').length;
  document.getElementById('count-rules').innerText = articles.filter(a => a.category === 'Qoidalar').length;
}

// LocalStorage va yangilash
function saveAndRefresh() {
  localStorage.setItem('wiki_articles', JSON.stringify(articles));
  renderArticles();
  updateCategoryCounts();
}

// Hodisalarni tinglash (Event Listeners)
function setupEventListeners() {
  // Qidiruv
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderArticles();
  });

  // Kategoriya tanlash
  categoryList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    
    document.querySelectorAll('#categoryList li').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    
    currentCategory = li.dataset.category;
    renderArticles();
  });

  // Tungi rejim
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggleBtn.innerText = isDark ? '🌙 Rejim' : '☀️ Rejim';
  });

  // Modal oyna
  openModalBtn.addEventListener('click', () => articleModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => articleModal.classList.add('hidden'));

  // Yangi maqola qo'shish
  articleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newArticle = {
      id: Date.now(),
      title: document.getElementById('titleInput').value,
      category: document.getElementById('categorySelect').value,
      tags: document.getElementById('tagsInput').value.split(',').map(t => t.trim()).filter(Boolean),
      content: document.contentInput = document.getElementById('contentInput').value,
      favorite: false,
      date: new Date().toISOString().split('T')[0]
    };

    articles.unshift(newArticle);
    saveAndRefresh();
    articleForm.reset();
    articleModal.classList.add('hidden');
  });
}

// Dasturni ishga tushirish
init();
