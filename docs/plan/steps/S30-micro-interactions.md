# S30 — Микро-интеракции карточек и кнопок (CSS-only)

## 1. Цель
Добавить тактильности интерактивным элементам в рамках ч/б-системы: стрелки кнопок, ховер карточек, фокус-стили — только CSS, без JS.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Дизайн: строгий ч/б, без теней/градиентов, инверсия ч/б на ховер уже есть (`.btn:hover`, `.product-card:hover` — transition .18s). Кнопки содержат inline-SVG стрелку (`.btn svg`). Сборка `node build.js`; правки этого шага — только в `styles.css`. Ограничение CONVENTIONS §5: hover — инверсия + transform ≤ 4px, 150–200 мс; всё новое — внутри `@media (prefers-reduced-motion:no-preference)`.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§5, §7), `docs/design-guide.md`, `styles.css` (`.btn`, `.product-card`, `.catalog-chip`, `.card-visual`).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S29 — done (общий анимационный слой уже задан; этот шаг его дополняет, не конфликтуя).

## 4. Затрагиваемые файлы
- `styles.css`
- корневые `*.html` — пересборка (формально не изменятся, но прогнать сборку по правилу §9 CONVENTIONS)

## 5. Точные инструкции
Все новые transition/transform — внутри `@media (prefers-reduced-motion:no-preference)`:
1. Стрелка кнопок: `.btn svg{transition:transform .18s}` + `.btn:hover svg{transform:translateX(4px)}`.
2. Карточки каталога: лёгкий подъём `.product-card:hover{transform:translateY(-3px)}` (+`transition:transform .18s` к существующим transition — аккуратно дополни, не перезаписав background/color). Картинка в card-visual (если S13 done): `.card-visual img{transition:transform .3s}` + `.product-card:hover .card-visual img{transform:scale(1.03)}` — с `overflow:hidden` на `.card-visual`.
3. Чипы фильтра: `.catalog-chip{transition:...,transform .15s}` + `:active{transform:scale(.97)}`.
4. Фокус-стили (вне media — доступность не анимация): единый видимый фокус `a:focus-visible,button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}` — проверь, что не конфликтует с существующим `.field input:focus`.
5. Ничего цветного, никаких теней; никакого JS. `node build.js`.

## 6. Definition of Done
- [ ] Ховеры: стрелка сдвигается, карточка приподнимается, картинка чуть масштабируется без выхода за рамку.
- [ ] :focus-visible виден на всех интерактивных элементах при Tab-навигации.
- [ ] При reduced-motion — статика (кроме мгновенной инверсии цвета, она допустима).
- [ ] Дизайн-система не нарушена (ч/б, углы, без теней).

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/`, `/uslugi`: мышью по кнопкам/карточкам/чипам; Tab-обход; Rendering → prefers-reduced-motion: reduce.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S30: микро-интеракции`. Обновить `docs/plan/STATE.md` (S30 → done, Журнал). Остановиться.
