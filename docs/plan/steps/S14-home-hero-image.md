# S14 — Хиро-изображение на главной

## 1. Цель
Дать главной странице визуальный якорь в хиро (сейчас — чистый текст), по образцу уже реализованного хиро /diagnostika (фон с маской и grayscale), без ущерба LCP.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js` из `src/pages/*.html`. Референс уже в коде: хиро `/diagnostika` (`src/pages/diagnostika.html`, блок `.hero-bg` с `<img class="hero-bg_img">`) + стили `.hero-bg` в `styles.css` (~строки 94–104): маска-градиент прячет левую часть, `filter:grayscale(1) contrast(1.05)`, `opacity:.5`, на мобильных маска снизу. Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§4), `docs/design-guide.md`, `src/pages/index.html`, `src/pages/diagnostika.html` (хиро), `styles.css` (`.hero`, `.hero-bg`).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S12 — done (согласован стиль изображений); S15 — желательно done (конвенции оптимизации применяются здесь сразу). Изображение для главной согласовать с владельцем (тематика: клиника/системность/рост; НЕ повторять фото с /diagnostika).

## 4. Затрагиваемые файлы
- `assets/hero-home.webp` (+ `assets/hero-home.jpg` fallback) — создать
- `src/pages/index.html` (блок `.hero-bg` в хиро)
- `build.js` — если нужен preload только на главной: добавь механизм страничного `extraHead` (или вставь preload статически в src главной невозможно — head генерится; используй механизм из S04/S10, если есть)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. Подбери/согласуй изображение (лицензия обязательна), приведи к ч/б и сожми: ширина 1600px, `magick in.jpg -colorspace Gray -resize 1600x -quality 78 assets/hero-home.webp` (+ jpg-фолбэк `-quality 70`). Целевой вес ≤ 150 КБ webp.
2. В `src/pages/index.html` в `<section class="hero">` первым ребёнком (по образцу diagnostika):
   ```html
   <div class="hero-bg" aria-hidden="true">
     <picture>
       <source srcset="/assets/hero-home.webp" type="image/webp">
       <img src="/assets/hero-home.jpg" alt="" class="hero-bg_img" width="1600" height="1067" fetchpriority="high">
     </picture>
   </div>
   ```
   (width/height — фактические пропорции файла.)
3. Существующие стили `.hero-bg` общие — новых стилей не требуется; проверь, что маска не съедает читаемость h1 на 1280–1440px и на мобильном.
4. Preload: в `<head>` главной добавь `<link rel="preload" as="image" href="/assets/hero-home.webp" type="image/webp">` через механизм постраничного extraHead в build.js (если S04 ввёл такой параметр — используй; иначе добавь минимальный: необязательный маркер `<!--HEADEXTRA-->…<!--/HEADEXTRA-->` в файле страницы, который build.js вставляет в head).
5. `node build.js`.

## 6. Definition of Done
- [ ] Главная имеет фоновое хиро-изображение: ч/б, с маской, текст читаем на всех ширинах.
- [ ] `<picture>` webp+jpg, width/height, fetchpriority=high, preload в head главной.
- [ ] Вес webp ≤ 150 КБ; LCP локально не деградировал (Lighthouse ориентир ≥ 90 perf).

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/` на 1440/1024/375px; DevTools Lighthouse (mobile) — LCP и CLS; убедиться, что изображение не перетягивает внимание с заголовка (opacity как у референса).

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S14: хиро-изображение главной`. Обновить `docs/plan/STATE.md` (S14 → done, Журнал). Остановиться.
