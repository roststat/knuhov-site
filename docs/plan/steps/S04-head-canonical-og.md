# S04 — Head-шаблон: canonical + Open Graph + Twitter cards

## 1. Цель
Каждая страница получает canonical и корректное превью при шаринге (Telegram/WhatsApp — основной канал тёплого трафика). Всё — через единый шаблон в `build.js`, без ручных правок страниц.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (медицинский консалтинг Ислама Кнухова). Плоский HTML/CSS/JS. Страницы собираются `node build.js`: функция `HEAD(title, description)` (~строка 126) печатает `<head>`, `assemble()` (~строка 141) склеивает страницу; сборка идёт по `src/pages/*.html` и по массиву `SERVICES` (страницы услуг). Корневые `*.html` — артефакты сборки. Хостинг — Vercel, канонический хост `https://knuhov.ru`.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§3 URL, §6 SEO-разметка), `docs/design-guide.md`, `build.js` целиком.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S01 — done (canonical должен указывать на чистые URL без `.html`).

## 4. Затрагиваемые файлы
- `build.js` (шаблон `HEAD`, `assemble`, оба цикла сборки)
- `assets/og-default.png` (создать: дефолтная OG-картинка 1200×630)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. В `build.js` добавь константу `const SITE_URL = 'https://knuhov.ru';` и функцию `canonicalPath(file)`: `'index.html'` → `'/'`, иначе `'/' + file.replace(/\.html$/, '')`.
2. Расширь сигнатуры: `HEAD(title, description, urlPath)` и `assemble(title, description, main, scripts, urlPath)`. В обоих циклах сборки (страницы из `src/pages` и услуги из `SERVICES`) передавай `canonicalPath(file)`. Страницу `404.html` (если уже есть) собирай БЕЗ canonical и OG:url — для этого допусти `urlPath === null` → пропустить canonical/og:url.
3. В `HEAD` после `<meta name="description">` добавь:
   ```html
   <link rel="canonical" href="${SITE_URL}${urlPath}">
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
   ```
4. Создай `assets/og-default.png` 1200×630 в стиле бренда: белый фон, чёрная мозаика (как favicon S03, если он сделан — переиспользуй мотив), текст «Dr.Консалтинг · KNUHOV.RU» и строка «Стратегический рост медицинского бизнеса», шрифт Space Grotesk, строго ч/б, фирменный нижний-правый скруглённый угол у рамки. Проще всего: свёрстать одноразовый HTML в scratch-каталоге и снять скриншот 1200×630, либо собрать SVG и отрендерить в PNG. Вес ≤ 200 КБ.
5. `node build.js`; выборочно проверь `<head>` у `index.html`, `uslugi.html`, `usluga-crm.html`.

## 6. Definition of Done
- [ ] На каждой собранной странице (кроме 404): canonical = `https://knuhov.ru` + чистый путь; полный набор og:*; twitter:card.
- [ ] `assets/og-default.png` 1200×630, ч/б, ≤ 200 КБ.
- [ ] Никаких canonical/OG, захардкоженных в `src/pages/*` — только шаблон.

## 7. Как проверить локально
`node build.js`; `grep -c 'og:title' *.html` — на всех страницах ровно 1; `grep 'rel="canonical"' usluga-crm.html` → `https://knuhov.ru/usluga-crm`. Открыть og-default.png и оценить глазами.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`. (Проверку превью в Telegram через @WebpageBot делать после реального деплоя.)

## 9. Финализация
Коммит `S04: canonical + OG в шаблон head`. Обновить `docs/plan/STATE.md` (S04 → done, Журнал). Остановиться.
