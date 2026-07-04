# S11 — Хлебные крошки (UI) на страницах услуг и кейсов

## 1. Цель
Видимые хлебные крошки «Главная → Услуги → {Категория} → {Услуга}»: навигация из тупиковых страниц услуг, внутренняя перелинковка, соответствие BreadcrumbList-разметке (S10).

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS. Страницы услуг генерирует `servicePageMain(s)` в `build.js` из массива `SERVICES`; категории — `CATEGORIES` (id: diagnostika/soprovozhdenie/tehnicheskie), фильтр каталога понимает deep-link `/uslugi#<id>`. Дизайн: строгий ч/б, Space Grotesk, квадратные точки-разделители `.sqdot` вместо круглых (design-guide §7), мелкие аплкейс-лейблы — класс `.kicker`. Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§7), `docs/design-guide.md` (§7), `build.js`, `styles.css` (`.kicker`, `.sqdot`, `.direction`), `src/pages/case-1.html`.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S01 — done (чистые URL). S10 не обязателен, но если done — крошки должны совпадать с разметкой по составу.

## 4. Затрагиваемые файлы
- `build.js` (`servicePageMain` — блок крошек в начало `<main>`)
- `src/pages/case-1.html`, `case-2.html` (крошки «Главная → Кейсы → Кейс»)
- `styles.css` (компонент `.crumbs`)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. В `styles.css` добавь компонент (в духе `.directions`):
   ```css
   .crumbs{display:flex;align-items:center;gap:12px;flex-wrap:wrap;
     font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
   .crumbs a{color:var(--muted);text-decoration:none}
   .crumbs a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
   .crumbs .sqdot{background:var(--muted)}
   .crumbs [aria-current]{color:var(--ink)}
   ```
2. В `servicePageMain(s)` первым элементом внутри `container--wide` (до заголовка) вставь:
   ```html
   <nav class="crumbs" aria-label="Хлебные крошки">
     <a href="/">Главная</a><span class="sqdot"></span>
     <a href="/uslugi">Услуги</a><span class="sqdot"></span>
     <a href="/uslugi#${s.cat}">${catLabel(s.cat)}</a><span class="sqdot"></span>
     <span aria-current="page">${s.title}</span>
   </nav>
   ```
   Существующий `<div class="kicker">${catLabel(s.cat)}</div>` над заголовком после этого убери (крошки её дублируют).
3. В `case-1.html`/`case-2.html` аналогичные крошки: Главная → Кейсы → «Кейс №1/№2».
4. Выравнивание: крошки идут в той же `container--wide`, слева, отступ снизу ~28px до заголовка. На ≤820px — перенос строк допустим.
5. `node build.js`.

## 6. Definition of Done
- [ ] На всех 11 страницах услуг и 2 кейсах — крошки с рабочими ссылками (категория ведёт на каталог с включённым фильтром).
- [ ] Стиль ч/б, квадратные разделители, ничего цветного.
- [ ] `<nav aria-label>` + `aria-current="page"` на последнем элементе.

## 7. Как проверить локально
`node build.js`; `npx serve .` → открыть `/usluga-crm` (клик по «Технические работы» должен открыть каталог с включённым фильтром этой категории), `/case-1`; проверить ≤820px.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S11: хлебные крошки на услугах и кейсах`. Обновить `docs/plan/STATE.md` (S11 → done, Журнал). Остановиться.
