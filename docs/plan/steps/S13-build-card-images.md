# S13 — build.js: поле image в SERVICES + рендер в карточках и на страницах услуг

## 1. Цель
Подключить изображения из S12 через data-driven архитектуру: поле `image` в объекте услуги → картинка в `card-visual` карточки каталога и в хиро страницы услуги.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS. Каталог и страницы услуг генерирует `build.js`: массив `SERVICES`, функции `cardHTML(s)` (карточка с `<div class="card-visual" aria-hidden="true"><span class="bi-dot"></span></div>`) и `servicePageMain(s)`. `card-visual` имеет `aspect-ratio:4/3` в `styles.css`. Изображения лежат в `assets/usluga-<slug>.webp` (или .svg — сверься с заметкой S12 в STATE.md). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§2, §4), `docs/design-guide.md`, `build.js`, `styles.css` (`.card-visual`, `.product-card`), `docs/plan/STATE.md` (заметка S12 о формате).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S12 — done (файлы изображений существуют). Проверь фактическое наличие: `ls assets/usluga-*`.

## 4. Затрагиваемые файлы
- `build.js` (`SERVICES` — поле `image`; `cardHTML`; `servicePageMain`)
- `styles.css` (стили `img` внутри `.card-visual`)
- корневые `uslugi.html`, `usluga-*.html`, `index.html` (если карточки направлений трогаются — НЕ трогаются, они статические в src) — пересборка

## 5. Точные инструкции
1. В каждый объект `SERVICES` со `slug` добавь `image: '/assets/usluga-<slug>.webp'` (расширение — по факту S12). Двум услугам категории «Диагностика» (без slug, с href) картинки на этом шаге не обязательны; если S12 сделал для них файлы — добавь тоже.
2. В `cardHTML(s)` замени содержимое card-visual:
   ```js
   const visual = s.image
     ? '<div class="card-visual" aria-hidden="true"><img src="' + s.image + '" alt="" width="800" height="600" loading="lazy"></div>'
     : '<div class="card-visual" aria-hidden="true"><span class="bi-dot"></span></div>';
   ```
   (`alt=""` — визуал декоративный, смысл несёт заголовок карточки; фолбэк с точкой сохраняем для услуг без картинки.)
3. В `styles.css` к `.card-visual`:
   ```css
   .card-visual img{width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1)}
   ```
   `filter:grayscale(1)` — страховка ч/б даже если исходник цветной (CONVENTIONS §4).
4. В `servicePageMain(s)`: над заголовком (после крошек, если S11 сделан) добавь тот же визуал шириной колонки — `<div class="card-visual" style="max-width:520px;margin:0 auto 28px" aria-hidden="true"><img ...></div>` или через новый класс, если инлайн-стиль разрастается.
5. `node build.js`.

## 6. Definition of Done
- [ ] Все карточки каталога `/uslugi` показывают изображения (или аккуратный фолбэк).
- [ ] Страницы услуг показывают визуал; изображения строго ч/б.
- [ ] У `<img>`: width/height, `loading="lazy"`, `alt=""` + aria-hidden на обёртке.
- [ ] Хавер-инверсия карточек не ломает картинку (проверить визуально).

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/uslugi` (все фильтры), `/usluga-crm`, `/usluga-smm`; ≤820px; DevTools → Network: карточные картинки грузятся лениво.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S13: изображения в карточках и на страницах услуг`. Обновить `docs/plan/STATE.md` (S13 → done, Журнал). Остановиться.
