# S15 — Оптимизация существующих изображений

## 1. Цель
Привести два существующих изображения к нормам: `assets/hero-bg.jpg` 552 КБ (LCP страницы /diagnostika) → WebP ≤ 120–150 КБ; `assets/islam.jpg` 84 КБ → WebP; всем `<img>` сайта — width/height и корректный loading.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js` из `src/pages/*.html` + партиалы. Использование изображений: `hero-bg.jpg` — фон хиро `/diagnostika` (`src/pages/diagnostika.html`, `<img class="hero-bg_img">`); `islam.jpg` — блок «Опыт» на `/` и `/diagnostika` (`.trust-photo img`) и аватар в попапе диагностики (`.audit-bridge_avatar img`, уже с width/height 76). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§4), `src/pages/index.html`, `src/pages/diagnostika.html`, `styles.css` (`.hero-bg`, `.trust-photo`).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет.

## 4. Затрагиваемые файлы
- `assets/hero-bg.webp`, `assets/islam.webp` (создать; старые jpg оставить как fallback)
- `src/pages/index.html`, `src/pages/diagnostika.html`
- `build.js` — только если добавляешь preload через head-механизм (см. S14 п.4)

## 5. Точные инструкции
1. Конвертация (ImageMagick/cwebp — что есть; зафиксируй команду в коммит-сообщении не нужно, достаточно результата):
   - `magick assets/hero-bg.jpg -resize 1600x -quality 78 assets/hero-bg.webp` (если исходник уже ≤1600 — без resize). Цель ≤ 150 КБ.
   - `magick assets/islam.jpg -resize 800x -quality 80 assets/islam.webp`. Цель ≤ 50 КБ.
   - Проверь фактические размеры пикселей: `magick identify assets/*.webp`.
2. `/diagnostika`: хиро-img оберни в `<picture>` (source webp + img jpg), добавь `width`/`height` (фактические), `fetchpriority="high"`; preload webp в head этой страницы, если есть механизм extraHead (S04/S14), иначе пропусти preload и отметь в STATE.
3. Блоки «Опыт» на `/` и `/diagnostika`: `trust-photo` img → `<picture>` webp+jpg, width/height фактические, `loading="lazy"` (блок ниже первого экрана). Аватар в попапе (`audit-bridge_avatar`) → просто замени src на webp, width/height уже есть, добавь `loading="lazy"`.
4. Убедись, что CSS-поведение не сломалось: `object-fit:cover` и `aspect-ratio` в `.trust-photo img` работают с `<picture><img>` так же.
5. `node build.js`.

## 6. Definition of Done
- [ ] hero-bg.webp ≤ 150 КБ; islam.webp ≤ 50 КБ; старые jpg остаются фолбэком в `<picture>`.
- [ ] Все `<img>` в src/ имеют width+height; ниже первого экрана — loading="lazy".
- [ ] Визуально ничего не поехало (маска хиро, кадрирование портрета, мобильная версия).

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/diagnostika` и `/` на десктопе и 375px; DevTools → Network: грузится webp, jpg не грузится; Lighthouse (mobile) на /diagnostika — CLS = 0, вес страницы упал.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S15: оптимизация изображений (webp, размеры, lazy)`. Обновить `docs/plan/STATE.md` (S15 → done, Журнал). Остановиться.
