#!/usr/bin/env node
/* Простая склейка страниц из src/pages/*.html + src/partials/{header,footer,scripts-base}.html
   в обычные статические .html в корне. Без фреймворка и зависимостей.

   Каталог услуг — data-driven: список услуг в SERVICES ниже. Добавить услугу = добавить объект.
   Из него генерируются: карточки и фильтры на странице «Услуги» (uslugi.html, маркеры
   <!--CHIPS--> и <!--CARDS-->) и отдельная страница каждой услуги (/usluga-<slug>.html),
   если у услуги задан slug (а не внешний href).

   Контент страниц услуг (pain / includes / forWhom) — черновой, требует согласования с Исламом. */
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
  { cat: 'diagnostika', title: 'Бесплатный тест', price: 'Бесплатно', href: '/diagnostika',
    teaser: 'Тест на 6 вопросов: тип системы и слой, где клиника теряет деньги. 2 минуты, без регистрации.' },
  { cat: 'diagnostika', title: 'Стратегический аудит', price: 'От 25 000 ₽', href: '/diagnostika#audit-card',
    teaser: 'Личный разбор слоёв бизнеса и дорожная карта роста на ближайшие шаги.' },

  // Сопровождение — работа с базой и аутсорс ролей
  { cat: 'soprovozhdenie', slug: 'rabota-s-bazoy', title: 'Работа с базой',
    seoTitle: 'Работа с базой пациентов клиники — Кнухов консалтинг',
    seoDescription: 'Реактивация «спящих» пациентов и удержание: сегментация базы, сценарии возврата, повторные визиты. Выручка из вашей базы — без роста рекламного бюджета.',
    teaser: 'Реактивация и удержание пациентов из вашей базы — выручка без нового трафика.',
    pain: 'Существующая база пациентов — это выручка, которая у вас уже есть, но не активирована. Большинство клиник не работают с базой системно и теряют повторные визиты.',
    includes: ['Сегментация базы по давности и услугам', 'Сценарии реактивации «спящих» пациентов', 'Напоминания о повторных визитах и профилактике', 'Возврат пациентов после первичного приёма', 'Отчётность по выручке, полученной с базы'],
    forWhom: 'Клиникам с накопленной базой, которые хотят растить выручку без увеличения рекламного бюджета.' },
  { cat: 'soprovozhdenie', slug: 'proektnyy-menedzher', title: 'Проектный менеджер',
    seoTitle: 'Проектный менеджер для клиники на аутсорсе — Кнухов консалтинг',
    seoDescription: 'Аутсорс-руководитель проектов для клиники: декомпозиция дорожной карты, задачи команде, контроль сроков и еженедельные статусы для собственника.',
    teaser: 'Аутсорс-руководитель проектов: держит внедрение, задачи и сроки под контролем.',
    pain: 'Изменения в клинике буксуют не из-за плохих идей, а из-за того, что некому довести их до конца. Проектный менеджер на аутсорсе превращает дорожную карту в выполненные задачи.',
    includes: ['Декомпозиция задач из дорожной карты', 'Постановка задач команде и контроль сроков', 'Еженедельные статусы для собственника', 'Координация подрядчиков и специалистов', 'Контроль результата, а не процесса'],
    forWhom: 'Собственникам, у которых нет выделенного управленца под проекты развития.' },
  { cat: 'soprovozhdenie', slug: 'reklamshchik', title: 'Рекламщик',
    seoTitle: 'Реклама для клиники: специалист на аутсорсе — Кнухов консалтинг',
    seoDescription: 'Ведение рекламы клиники под реальные цели: связка с CRM и аналитикой, контроль стоимости заявки и пациента, регулярная отчётность по результату.',
    teaser: 'Аутсорс-специалист по трафику: ведёт рекламу под продукт и цели клиники.',
    pain: 'Реклама без связки с продуктом и воронкой просто жжёт бюджет. Аутсорс-специалист ведёт трафик под реальные цели клиники, а не ради «заявок любой ценой».',
    includes: ['Аудит текущих каналов и связок', 'Настройка и ведение рекламных кампаний', 'Связка рекламы с CRM и аналитикой', 'Контроль стоимости заявки и пациента', 'Регулярная отчётность по результату'],
    forWhom: 'Клиникам, которым нужен предсказуемый поток заявок, а не разовые всплески.' },
  { cat: 'soprovozhdenie', slug: 'hr', title: 'HR',
    seoTitle: 'HR для клиники: подбор и адаптация персонала — Кнухов консалтинг',
    seoDescription: 'Подбор, найм и адаптация сотрудников клиники на аутсорсе: профили должностей, онбординг, регламенты. Снимаем с собственника найм и текучку.',
    teaser: 'Подбор, найм и адаптация персонала клиники на аутсорсе.',
    pain: 'Сервис и выручка клиники упираются в людей. Системный подбор и адаптация снимают зависимость от «звёзд» и постоянной текучки.',
    includes: ['Профили должностей и сценарии найма', 'Подбор и первичный отбор кандидатов', 'Адаптация и онбординг новых сотрудников', 'Регламенты и стандарты работы', 'Поддержка руководителя по кадровым вопросам'],
    forWhom: 'Растущим клиникам, где собственник тратит слишком много времени на найм и текучку.' },
  { cat: 'soprovozhdenie', slug: 'smm', title: 'SMM',
    seoTitle: 'SMM для клиники: ведение соцсетей — Кнухов консалтинг',
    seoDescription: 'Ведение соцсетей клиники: контент-стратегия, упаковка профиля, кейсы и отзывы, прогрев к записи. Пациенты выбирают вас ещё до звонка.',
    teaser: 'Ведение соцсетей клиники: контент, упаковка и доверие к бренду.',
    pain: 'Соцсети формируют доверие ещё до первого визита. Без системного ведения клиника теряет «тёплых» пациентов, которые выбирают глазами.',
    includes: ['Контент-стратегия и рубрикатор', 'Регулярные публикации и упаковка профиля', 'Оформление кейсов и отзывов', 'Прогрев аудитории к записи', 'Аналитика охватов и заявок'],
    forWhom: 'Клиникам, которые хотят, чтобы пациенты выбирали их ещё до звонка.' },
  { cat: 'soprovozhdenie', slug: 'taynyy-pokupatel', title: 'Тайный покупатель',
    seoTitle: 'Тайный покупатель для клиники — Кнухов консалтинг',
    seoDescription: 'Проверяем звонки и визит глазами пациента: чек-лист сервиса и продаж, запись разговоров, разбор точек потерь заявок. Честная картина вашего сервиса.',
    teaser: 'Проверяем сервис и звонки глазами пациента — находим, где вы теряете заявки.',
    pain: 'Вы не узнаете, сколько заявок теряется на звонке и на ресепшене, пока не посмотрите глазами пациента. Тайный покупатель показывает реальную картину сервиса.',
    includes: ['Сценарии проверки звонков и визита', 'Прозвон и визит под видом пациента', 'Оценка по чек-листу сервиса и продаж', 'Запись и разбор разговоров', 'Рекомендации по точкам потерь'],
    forWhom: 'Клиникам, где есть поток заявок, но конверсия в запись и визит ниже ожидаемой.' },

  // Технические работы
  { cat: 'tehnicheskie', slug: 'crm', title: 'Настройка CRM',
    seoTitle: 'Внедрение и настройка CRM для клиники — Кнухов консалтинг',
    seoDescription: 'Выбор и настройка CRM под клинику: перенос базы, воронки и статусы пациентов, обучение администраторов. Ни одна заявка не теряется между этапами.',
    teaser: 'Учёт и ведение пациентов в CRM — ни одна заявка не теряется между этапами.',
    pain: 'Если заявки и пациенты ведутся в блокноте или в голове администратора — часть из них теряется. CRM делает поток пациентов управляемым и прозрачным.',
    includes: ['Аудит текущего процесса записи', 'Выбор и настройка CRM под клинику', 'Импорт и структурирование базы', 'Воронки и статусы пациентов', 'Обучение администраторов работе в системе'],
    forWhom: 'Клиникам без единой системы учёта пациентов или с хаотично заведённой CRM.' },
  { cat: 'tehnicheskie', slug: 'skvoznaya-analitika', title: 'Сквозная аналитика',
    seoTitle: 'Сквозная аналитика для клиники — Кнухов консалтинг',
    seoDescription: 'Связка «реклама → заявка → визит → выручка»: цели, коллтрекинг, дашборд окупаемости. Видно, какая реклама приводит пациентов, а какая жжёт бюджет.',
    teaser: 'Видно, какие источники приводят пациентов, а какие просто жгут бюджет.',
    pain: 'Без сквозной аналитики невозможно понять, какая реклама приносит пациентов, а какая — только заявки. Решения по бюджету принимаются вслепую.',
    includes: ['Связка «реклама → заявка → запись → визит → выручка»', 'Настройка целей и коллтрекинга', 'Дашборд по источникам и окупаемости', 'Регулярные отчёты для собственника', 'Рекомендации по перераспределению бюджета'],
    forWhom: 'Клиникам, которые вкладывают в рекламу и хотят видеть отдачу в деньгах.' },
  { cat: 'tehnicheskie', slug: 'telefoniya', title: 'Телефония',
    seoTitle: 'IP-телефония для клиники — Кнухов консалтинг',
    seoDescription: 'Подключение IP-телефонии для клиники: запись звонков, интеграция с CRM и коллтрекингом, контроль пропущенных. Ни одно обращение не теряется.',
    teaser: 'IP-телефония и запись звонков, связанные с CRM и аналитикой.',
    pain: 'Пропущенные и не разобранные звонки — это потерянные пациенты. IP-телефония связывает звонки с CRM и аналитикой и не даёт обращениям теряться.',
    includes: ['Подключение и настройка IP-телефонии', 'Запись и хранение звонков', 'Интеграция с CRM и коллтрекингом', 'Контроль пропущенных и обратный обзвон', 'Отчётность по звонкам'],
    forWhom: 'Клиникам с входящим потоком звонков, где важно не терять ни одного обращения.' },
  { cat: 'tehnicheskie', slug: 'rassylki', title: 'Рассылки',
    seoTitle: 'Рассылки и напоминания пациентам клиники — Кнухов консалтинг',
    seoDescription: 'Автоматические напоминания о визитах и профилактике: SMS, мессенджеры, email. Триггеры в CRM возвращают пациентов и повышают доходимость.',
    teaser: 'Автоматические напоминания и рассылки о визитах и акциях.',
    pain: 'Пациент забывает о визите и профилактике — клиника теряет повторную выручку. Автоматические рассылки возвращают его вовремя.',
    includes: ['Сценарии напоминаний о визитах', 'Рассылки о профилактике и повторных приёмах', 'Акции и реактивация по базе', 'Каналы: SMS, мессенджеры, email', 'Настройка триггеров в CRM'],
    forWhom: 'Клиникам с базой, которые хотят повысить доходимость и повторные визиты.' },
  { cat: 'tehnicheskie', slug: 'avtoobzvony', title: 'Автообзвоны',
    seoTitle: 'Автообзвоны пациентов для клиники — Кнухов консалтинг',
    seoDescription: 'Автоматический обзвон базы: подтверждение записей, возврат пациентов, маршрутизация заинтересованных на администратора. Без нагрузки на ресепшен.',
    teaser: 'Автоматический обзвон для подтверждения записей и возврата пациентов.',
    pain: 'Ручной обзвон базы дорог и нестабилен. Автообзвон подтверждает записи и возвращает пациентов без нагрузки на администраторов.',
    includes: ['Сценарии автообзвона: подтверждение, возврат, акции', 'Настройка робота и голосовых сообщений', 'Интеграция с CRM и расписанием', 'Маршрутизация заинтересованных на администратора', 'Отчётность по дозвону'],
    forWhom: 'Клиникам с большой базой и высокой нагрузкой на ресепшен.' },
];

function catLabel(id) { const c = CATEGORIES.find(x => x.id === id); return c ? c.label : ''; }
function serviceHref(s) { return s.href || ('/usluga-' + s.slug); }

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

const SITE_URL = 'https://knuhov.ru';
/* Чистый канонический путь страницы: index.html -> /, uslugi.html -> /uslugi */
function canonicalPath(file) { return file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, ''); }

/* Базовый JSON-LD: организация + основатель + сайт. Печатается на всех страницах.
   Телефон/email/адрес/sameAs НЕ добавлять, пока владелец не дал реальные данные (шаг S18). */
const BASE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'ProfessionalService', '@id': SITE_URL + '/#org',
      name: 'Кнухов консалтинг', url: SITE_URL + '/',
      description: 'Консалтинг для медицинского бизнеса: диагностика, сопровождение и техническая настройка роста выручки клиник.',
      founder: { '@id': SITE_URL + '/#islam' },
      areaServed: 'RU',
      knowsAbout: ['медицинский консалтинг', 'управление клиникой', 'CRM для клиник', 'аналитика медицинского бизнеса'] },
    { '@type': 'Person', '@id': SITE_URL + '/#islam',
      name: 'Ислам Кнухов',
      jobTitle: 'Стратег по развитию медицинских проектов',
      worksFor: { '@id': SITE_URL + '/#org' },
      image: SITE_URL + '/assets/islam.jpg' },
    { '@type': 'WebSite', '@id': SITE_URL + '/#website',
      url: SITE_URL + '/', name: 'Кнухов консалтинг',
      inLanguage: 'ru-RU', publisher: { '@id': SITE_URL + '/#org' } }
  ]
};

const HEAD = (title, description, noindex, urlPath) => {
  // urlPath === null (напр. 404) -> без canonical и og:url
  const og = urlPath ? `<link rel="canonical" href="${SITE_URL}${urlPath}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Кнухов консалтинг">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE_URL}${urlPath}">
<meta property="og:image" content="${SITE_URL}/assets/og-default.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
` : '';
  const robots = noindex ? '<meta name="robots" content="noindex,follow">\n' : '';
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
${robots}${og}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script type="application/ld+json">${JSON.stringify(BASE_JSONLD)}</script>
</head>
<body>
`;
};

function assemble(title, description, main, scripts, noindex, urlPath) {
  return HEAD(title, description, noindex, urlPath) +
    header + '\n\n' +
    main + '\n\n' +
    footer + '\n\n' +
    scriptsBase +
    (scripts ? '\n' + scripts : '') + '\n' +
    '</body>\n</html>\n';
}

/* ===== Сборка страниц из src/pages ===== */
const sitemapUrls = []; // канонические URL для sitemap.xml (без noindex и 404)
const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
for (const file of pages) {
  const src = read(path.join(PAGES_DIR, file));
  const title = extract(src, 'TITLE');
  const description = extract(src, 'DESCRIPTION');
  let main = extract(src, 'MAIN');
  const scripts = extract(src, 'SCRIPTS');
  // Маркер <!--NOINDEX--> в файле страницы -> meta robots noindex (кейсы-заглушки и т.п.)
  const noindex = src.indexOf('<!--NOINDEX-->') !== -1;

  // Каталог: подставляем сгенерированные фильтры и карточки
  main = main.replace('<!--CHIPS-->', chipsHTML()).replace('<!--CARDS-->', cardsHTML());

  // 404 собирается без canonical/OG (urlPath = null) и не попадает в sitemap
  const urlPath = file === '404.html' ? null : canonicalPath(file);
  fs.writeFileSync(path.join(ROOT, file), assemble(title, description, main, scripts, noindex, urlPath));
  if (!noindex && urlPath) sitemapUrls.push(urlPath);
  console.log('built ' + file);
}

/* ===== Генерация страниц отдельных услуг ===== */
function stepRows(items) {
  return (items || []).map((it, i) =>
    '          <div class="step-row">\n' +
    '            <span class="step-num">' + ('0' + (i + 1)).slice(-2) + '</span>\n' +
    '            <div class="step-text"><h3>' + it + '</h3></div>\n' +
    '          </div>').join('\n');
}

function servicePageMain(s) {
  return `<main id="top">

  <section class="benefits" id="usluga-${s.slug}" style="padding-top:64px">
    <div class="container container--wide">
      <div class="benefits_content">
        <div style="text-align:center">
          <div class="kicker">${catLabel(s.cat)}</div>
          <h1 class="h1-inner">${s.title}</h1>
          <p class="lead" style="margin:14px auto 0">${s.pain || s.teaser}</p>
        </div>
        <div>
          <h2 class="h2-sub">Что входит</h2>
          <div class="audit-steps">
${stepRows(s.includes)}
          </div>
        </div>
        <div>
          <h2 class="h2-sub" style="margin-bottom:10px">Для кого</h2>
          <p class="lead">${s.forWhom || ''}</p>
        </div>
        <div style="text-align:center">
          <p class="pc-sub" style="max-width:520px;margin:0 auto 18px">Стоимость обсуждается индивидуально — зависит от размера клиники и объёма работ.</p>
          <a class="btn" href="/contacts">Оставить заявку
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

</main>`;
}

/* JSON-LD страницы услуги: Service + BreadcrumbList (из данных SERVICES).
   Цену НЕ размечаем (offers) — на страницах она «обсуждается индивидуально». */
function serviceJSONLD(s) {
  const url = SITE_URL + '/usluga-' + s.slug;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', '@id': url + '#service',
        name: s.title, description: s.seoDescription || s.teaser,
        serviceType: catLabel(s.cat), url: url,
        provider: { '@id': SITE_URL + '/#org' }, areaServed: 'RU' },
      { '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: 'Услуги', item: SITE_URL + '/uslugi' },
          { '@type': 'ListItem', position: 3, name: catLabel(s.cat), item: SITE_URL + '/uslugi#' + s.cat },
          { '@type': 'ListItem', position: 4, name: s.title }
        ] }
    ]
  };
}

for (const s of SERVICES) {
  if (!s.slug) continue; // услуги с href (диагностика) собственной страницы не имеют
  const file = 'usluga-' + s.slug + '.html';
  const ldScript = '<script type="application/ld+json">' + JSON.stringify(serviceJSONLD(s)) + '</script>';
  fs.writeFileSync(path.join(ROOT, file), assemble(s.seoTitle || (s.title + ' — Кнухов консалтинг'), s.seoDescription || s.teaser, servicePageMain(s), ldScript, false, canonicalPath(file)));
  sitemapUrls.push(canonicalPath(file));
  console.log('built ' + file + ' (service)');
}

/* ===== Генерация sitemap.xml ===== */
function sitemapXML(urls) {
  const today = new Date().toISOString().slice(0, 10);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + SITE_URL + u + '</loc><lastmod>' + today + '</lastmod></url>').join('\n') +
    '\n</urlset>\n';
}
sitemapUrls.sort();
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXML(sitemapUrls));
console.log('built sitemap.xml (' + sitemapUrls.length + ' urls)');
