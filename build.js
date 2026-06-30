#!/usr/bin/env node
/* Простая склейка страниц из src/pages/*.html + src/partials/{header,footer,scripts-base}.html
   в обычные статические .html в корне. Без фреймворка и зависимостей.

   Каталог услуг — data-driven: список услуг в SERVICES ниже. Добавить услугу = добавить объект.
   Из него генерируются: карточки и фильтры на странице «Услуги» (uslugi.html, маркеры
   <!--CHIPS--> и <!--CARDS-->) и отдельная страница каждой услуги (/usluga-<slug>.html),
   если у услуги задан slug (а не внешний href). */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, 'src/pages');
const PARTIALS_DIR = path.join(ROOT, 'src/partials');

function read(p) { return fs.readFileSync(p, 'utf8'); }
function extract(src, tag) {
  const m = src.match(new RegExp('<!--' + tag + '-->([\\s\\S]*?)<!--/' + tag + '-->'));
  return m ? m[1].trim() : '';
}

/* ===== Данные каталога ===== */
const CATEGORIES = [
  { id: 'diagnostika',    label: 'Диагностика' },
  { id: 'soprovozhdenie', label: 'Сопровождение' },
  { id: 'tehnicheskie',   label: 'Технические работы' },
];

const SERVICES = [
  // Диагностика — обе услуги живут на лендинге Экспресс-диагностики (href), свои страницы не генерим
  { cat: 'diagnostika', title: 'Бесплатный тест', price: 'Бесплатно', href: '/diagnostika.html',
    teaser: 'Тест на 6 вопросов: тип системы и слой, где клиника теряет деньги. 2 минуты, без регистрации.' },
  { cat: 'diagnostika', title: 'Стратегический аудит', price: 'От 25 000 ₽', href: '/diagnostika.html#audit-card',
    teaser: 'Личный разбор слоёв бизнеса и дорожная карта роста на ближайшие шаги.' },

  // Сопровождение — работа с базой и аутсорс ролей
  { cat: 'soprovozhdenie', slug: 'rabota-s-bazoy', title: 'Работа с базой',
    teaser: 'Реактивация и удержание пациентов из вашей базы — выручка без нового трафика.' },
  { cat: 'soprovozhdenie', slug: 'proektnyy-menedzher', title: 'Проектный менеджер',
    teaser: 'Аутсорс-руководитель проектов: держит внедрение, задачи и сроки под контролем.' },
  { cat: 'soprovozhdenie', slug: 'reklamshchik', title: 'Рекламщик',
    teaser: 'Аутсорс-специалист по трафику: ведёт рекламу под продукт и цели клиники.' },
  { cat: 'soprovozhdenie', slug: 'hr', title: 'HR',
    teaser: 'Подбор, найм и адаптация персонала клиники на аутсорсе.' },
  { cat: 'soprovozhdenie', slug: 'smm', title: 'SMM',
    teaser: 'Ведение соцсетей клиники: контент, упаковка и доверие к бренду.' },
  { cat: 'soprovozhdenie', slug: 'taynyy-pokupatel', title: 'Тайный покупатель',
    teaser: 'Проверяем сервис и звонки глазами пациента — находим, где вы теряете заявки.' },

  // Технические работы
  { cat: 'tehnicheskie', slug: 'crm', title: 'Настройка CRM',
    teaser: 'Учёт и ведение пациентов в CRM — ни одна заявка не теряется между этапами.' },
  { cat: 'tehnicheskie', slug: 'skvoznaya-analitika', title: 'Сквозная аналитика',
    teaser: 'Видно, какие источники приводят пациентов, а какие просто жгут бюджет.' },
  { cat: 'tehnicheskie', slug: 'telefoniya', title: 'Телефония',
    teaser: 'IP-телефония и запись звонков, связанные с CRM и аналитикой.' },
  { cat: 'tehnicheskie', slug: 'rassylki', title: 'Рассылки',
    teaser: 'Автоматические напоминания и рассылки о визитах и акциях.' },
  { cat: 'tehnicheskie', slug: 'avtoobzvony', title: 'Автообзвоны',
    teaser: 'Автоматический обзвон для подтверждения записей и возврата пациентов.' },
];

function catLabel(id) { const c = CATEGORIES.find(x => x.id === id); return c ? c.label : ''; }
function serviceHref(s) { return s.href || ('/usluga-' + s.slug + '.html'); }

function chipsHTML() {
  const chips = ['<button class="catalog-chip is-active" data-filter="all">Все</button>'];
  CATEGORIES.forEach(c => chips.push('<button class="catalog-chip" data-filter="' + c.id + '">' + c.label + '</button>'));
  return chips.join('\n          ');
}

function cardHTML(s) {
  return '          <a class="product-card catalog-card" data-category="' + s.cat + '" href="' + serviceHref(s) + '">\n' +
    '            <div class="card-visual" aria-hidden="true"><span class="bi-dot"></span></div>\n' +
    '            <div class="pc-body">\n' +
    '              <span class="pc-tag">' + catLabel(s.cat) + '</span>\n' +
    '              <h3>' + s.title + '</h3>\n' +
    '              <p class="pc-sub">' + s.teaser + '</p>\n' +
    '            </div>\n' +
    '            <p class="pc-price">' + (s.price || 'По запросу') + '</p>\n' +
    '          </a>';
}

function cardsHTML() { return SERVICES.map(cardHTML).join('\n'); }

/* ===== Партиалы и шаблон head ===== */
const header = read(path.join(PARTIALS_DIR, 'header.html'));
const footer = read(path.join(PARTIALS_DIR, 'footer.html'));
const scriptsBase = read(path.join(PARTIALS_DIR, 'scripts-base.html'));

const HEAD = (title, description) => `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
`;

function assemble(title, description, main, scripts) {
  return HEAD(title, description) +
    header + '\n\n' +
    main + '\n\n' +
    footer + '\n\n' +
    scriptsBase +
    (scripts ? '\n' + scripts : '') + '\n' +
    '</body>\n</html>\n';
}

/* ===== Сборка страниц из src/pages ===== */
const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
for (const file of pages) {
  const src = read(path.join(PAGES_DIR, file));
  const title = extract(src, 'TITLE');
  const description = extract(src, 'DESCRIPTION');
  let main = extract(src, 'MAIN');
  const scripts = extract(src, 'SCRIPTS');

  // Каталог: подставляем сгенерированные фильтры и карточки
  main = main.replace('<!--CHIPS-->', chipsHTML()).replace('<!--CARDS-->', cardsHTML());

  fs.writeFileSync(path.join(ROOT, file), assemble(title, description, main, scripts));
  console.log('built ' + file);
}

/* ===== Генерация страниц отдельных услуг ===== */
function servicePageMain(s) {
  return `<main id="top">

  <section class="benefits" id="usluga-${s.slug}" style="padding-top:64px">
    <div class="container container--wide">
      <div class="benefits_content">
        <div style="text-align:center">
          <div class="kicker">${catLabel(s.cat)}</div>
          <h2>${s.title}</h2>
          <p class="lead" style="margin:14px auto 0">${s.teaser}</p>
        </div>
        <div class="audit-steps">
          <div class="step-row">
            <span class="step-num">01</span>
            <div class="step-text">
              <h3>[Черновик] Что входит</h3>
              <p>Список этапов появится здесь после согласования.</p>
            </div>
          </div>
          <div class="step-row">
            <span class="step-num">02</span>
            <div class="step-text">
              <h3>[Черновик] Для кого</h3>
              <p>Описание целевой клиники появится здесь.</p>
            </div>
          </div>
        </div>
        <div style="text-align:center">
          <a class="btn" href="/contacts.html">Оставить заявку
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

</main>`;
}

for (const s of SERVICES) {
  if (!s.slug) continue; // услуги с href (диагностика) собственной страницы не имеют
  const file = 'usluga-' + s.slug + '.html';
  fs.writeFileSync(path.join(ROOT, file), assemble(s.title + ' — Кнухов консалтинг', s.teaser, servicePageMain(s), ''));
  console.log('built ' + file + ' (service)');
}
