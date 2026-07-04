# S31 — prefers-reduced-motion для JS-анимаций

## 1. Цель
JS-анимация счётчика цифр в блоке «Опыт» игнорирует prefers-reduced-motion (CSS-правило `*{transition:none!important}` на requestAnimationFrame не действует). Добавить guard всем JS-анимациям.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js`. Проблемное место: `src/partials/scripts-base.html`, IIFE «Анимация подсчёта цифр» (~строки 10–36): `animateCount()` гонит rAF 1200 мс для `.trust-num[data-count]`. Там же — blink кнопки `.pc-action` (CSS-анимация — её гасит существующее reduced-motion правило styles.css, трогать не надо). Если S29 (scroll-reveal) выполнен — его guard уже стоит; проверь по коду.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§5), `src/partials/scripts-base.html`, `styles.css` (медиа reduced-motion), `src/pages/diagnostika.html` (`<!--SCRIPTS-->` — есть ли там rAF/анимации; прогресс-бар теста анимируется CSS-transition — покрыт styles.css).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет (независим от S29; если S29 done — не дублируй его guard, просто сверь единообразие).

## 4. Затрагиваемые файлы
- `src/partials/scripts-base.html`
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. В IIFE счётчика добавь в начало:
   ```js
   var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   ```
   и в `animateCount(el)` первой строкой: `if(reduceMotion){el.textContent=el.dataset.count;return;}` — цифра ставится сразу, без анимации. IntersectionObserver оставить (цифра всё равно должна появиться при доскролле — или проще: при reduceMotion сразу проставить все значения и не создавать observer).
2. Проведи ревизию остальных JS-анимаций в проекте (`grep -rn 'requestAnimationFrame\|animate' src/`) — на момент написания шага rAF только в счётчике; если появились новые (S29 и др.) — убедись, что guard есть у каждой.
3. `node build.js`.

## 6. Definition of Done
- [ ] При эмуляции reduced-motion цифры 100/20/5 появляются мгновенно готовыми значениями.
- [ ] Без reduced-motion счётчик работает как раньше.
- [ ] Все rAF-анимации в кодовой базе имеют guard (grep-ревизия).

## 7. Как проверить локально
`node build.js`; `npx serve .` → `/` и `/diagnostika`, блок «Опыт»: DevTools → Rendering → Emulate prefers-reduced-motion: reduce → перезагрузка → цифры статичные; выключить эмуляцию → счёт идёт.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S31: reduced-motion guard для JS-анимаций`. Обновить `docs/plan/STATE.md` (S31 → done, Журнал). Остановиться.
