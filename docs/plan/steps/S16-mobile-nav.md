# S16 — Мобильная навигация (бургер-меню)

## 1. Цель
Критический дефект: на ширине ≤820px навигация и CTA-кнопка просто скрыты (`styles.css`: `.nav,.nav-cta{display:none}`) — с телефона нельзя перейти ни в услуги, ни на диагностику. Сделать бургер-меню в стиле бренда.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (мобайл — приоритетный сценарий: тёплый трафик по ссылке с телефона). Плоский HTML/CSS/JS. Шапка — партиал `src/partials/header.html` (фиксированная, высота `--header-h:4.375rem`, grid 3 колонки: бренд/нав/CTA); сквозной JS — `src/partials/scripts-base.html` (IIFE-паттерн, ES5). Дизайн: ч/б, фирменный угол `--radius:0 0 24px 0`, без теней; в попапе диагностики уже есть механика открытия/закрытия с `body.popup-locked` — образец стиля кода. Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§5, §7), `docs/design-guide.md` (§4 меню), `src/partials/header.html`, `src/partials/scripts-base.html`, `styles.css` (`.site-header`, `.nav`, медиа-блок ~строка 383).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет. (Если S01 done — ссылки в меню уже чистые; используй актуальные из header.html.)

## 4. Затрагиваемые файлы
- `src/partials/header.html` (кнопка-бургер + мобильная панель)
- `styles.css` (стили бургера и панели, правка медиа-блока)
- `src/partials/scripts-base.html` (JS открытия/закрытия)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. В `header.html` после `.nav-cta` добавь кнопку (видна только ≤820px):
   ```html
   <button class="nav-burger" type="button" aria-label="Меню" aria-expanded="false" aria-controls="mobile-nav">
     <span></span><span></span><span></span>
   </button>
   ```
   и перед `</header>` панель:
   ```html
   <nav class="mobile-nav" id="mobile-nav" aria-label="Мобильная навигация" hidden>
     <a href="/#top">Главная</a>
     <a href="/uslugi">Услуги</a>
     <a href="/cases">Кейсы</a>
     <a href="/contacts">Контакты</a>
     <a class="btn btn--dark" href="/diagnostika">Экспресс-диагностика</a>
   </nav>
   ```
   (Ссылки — синхронно с текущей `.nav`; если S01 ещё не сделан, используй `.html`-варианты как в текущем файле.)
2. Стили (ч/б, фирменный угол, без теней): бургер — 3 чёрные полоски 2px, квадратная кнопка 40×40 с рамкой 1px и `--radius-sm`; при `aria-expanded="true"` полоски складываются в крест (transform, transition 180ms). Панель: `position:fixed; top:var(--header-h); left:0; right:0; background:var(--paper); border:1px solid var(--line); border-radius:var(--radius);` колонка ссылок 19px/500 с паддингом 20–24px, CTA-кнопка внизу на всю ширину. Десктоп: `.nav-burger,.mobile-nav{display:none}`. Мобайл (≤820px): показать бургер (grid-колонка 3, justify-self:end), панель по состоянию.
3. JS в `scripts-base.html` (новый IIFE в стиле существующих): клик по `.nav-burger` тумблерит `hidden` у панели + `aria-expanded` + класс `body.mnav-locked` (опционально `overflow:hidden`); Escape и клик по ссылке панели закрывают; при ресайзе >820px — закрыть.
4. reduced-motion: анимация полосок/появления панели — внутри `@media (prefers-reduced-motion:no-preference)`.
5. `node build.js`.

## 6. Definition of Done
- [ ] На 375–820px в шапке есть бургер; меню открывается/закрывается, все 4 раздела + CTA доступны.
- [ ] `aria-expanded`/`aria-controls` корректно переключаются; Escape закрывает; фокус доступен с клавиатуры.
- [ ] На десктопе ничего не изменилось.
- [ ] Стиль строго ч/б с фирменным углом; при reduced-motion — без анимаций.

## 7. Как проверить локально
`node build.js`; `npx serve .` → DevTools responsive 375px: открыть меню на каждой странице (шапка сквозная — достаточно 2–3), перейти по ссылкам; проверить клавиатуру (Tab/Enter/Escape) и эмуляцию reduced-motion.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S16: мобильная навигация (бургер)`. Обновить `docs/plan/STATE.md` (S16 → done, Журнал). Остановиться.
