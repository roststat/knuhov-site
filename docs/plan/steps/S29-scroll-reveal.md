# S29 — Scroll-reveal секций

## 1. Цель
Аккуратное появление контента при скролле (владелец хочет «живости» без превращения в эффектную простыню): секции и карточки мягко поднимаются и проявляются один раз, с полным отключением при prefers-reduced-motion.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js`; сквозной JS — `src/partials/scripts-base.html` (IIFE, ES5, без библиотек; там уже есть IntersectionObserver для счётчика цифр — образец). Дизайн: строгий ч/б, анимации тонкие (CONVENTIONS §5: 350–450 мс, `cubic-bezier(.22,.61,.36,1)`, каскад ≤3 элементов с шагом 80 мс, обязательный reduced-motion). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§5), `src/partials/scripts-base.html`, `styles.css` (медиа-блок reduced-motion ~строка 398), `src/pages/index.html` (структура секций).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет.

## 4. Затрагиваемые файлы
- `styles.css` (классы `.reveal`, `.reveal.is-visible`)
- `src/partials/scripts-base.html` (IIFE с IntersectionObserver)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. CSS (обёрнуто в media, чтобы reduced-motion получал контент сразу):
   ```css
   @media (prefers-reduced-motion:no-preference){
     .reveal{opacity:0;transform:translateY(16px);
       transition:opacity .4s cubic-bezier(.22,.61,.36,1),transform .4s cubic-bezier(.22,.61,.36,1)}
     .reveal.is-visible{opacity:1;transform:none}
     .reveal:nth-child(2){transition-delay:.08s}
     .reveal:nth-child(3){transition-delay:.16s}
   }
   ```
2. JS в `scripts-base.html` (новый IIFE): выбрать цели АВТОМАТИЧЕСКИ, без правки страниц — `document.querySelectorAll('main section, .product-grid > *')`, навесить класс `reveal`, наблюдать IntersectionObserver'ом (`threshold:.12`), при пересечении — `is-visible` + `unobserve`. Guard: если `matchMedia('(prefers-reduced-motion: reduce)').matches` или нет IntersectionObserver — не навешивать `reveal` вовсе (выход из IIFE). Хиро-секцию (первую) пропускать — первый экран должен быть виден мгновенно (LCP).
3. Подводный камень: элементы, уже видимые при загрузке (короткие страницы), не должны мигать — наблюдатель сработает сразу, это ок; но проверь отсутствие «прыжка» на якорных переходах (`/uslugi#tehnicheskie`): при переходе по хешу элементы над целью получат is-visible при скролле вверх — приемлемо; если заметен дёрг, добавь в JS немедленную активацию всех элементов выше текущего вьюпорта.
4. `node build.js`.

## 6. Definition of Done
- [ ] Секции ниже первого экрана мягко проявляются один раз; хиро — без анимации.
- [ ] При эмуляции reduced-motion всё видно сразу, без transition (и счётчик/печаталка не затронуты этим шагом).
- [ ] Попап диагностики, фильтр каталога, счётчик работают как раньше.
- [ ] Без CLS: transform/opacity only, никакого изменения layout.

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/`, `/uslugi`, `/usluga-crm`, `/diagnostika` — скролл сверху вниз; DevTools → Rendering → Emulate prefers-reduced-motion; переход по `/uslugi#tehnicheskie` напрямую.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S29: scroll-reveal секций`. Обновить `docs/plan/STATE.md` (S29 → done, Журнал). Остановиться.
