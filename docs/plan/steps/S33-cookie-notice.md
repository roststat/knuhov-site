# S33 — Уведомление о cookie/метрике

## 1. Цель
После установки Я.Метрики (S32) сайт ставит куки и собирает обезличенную статистику — по практике 152-ФЗ показать ненавязчивое уведомление со ссылкой на политику.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js`; сквозные элементы — в партиалах (`src/partials/footer.html`, JS — `src/partials/scripts-base.html`). Дизайн: строгий ч/б, Space Grotesk, фирменный нижний-правый угол (`--radius`), без теней; готовые классы `.btn`, `.btn--sm`. Политика конфиденциальности — `/politika-konfidencialnosti` (S19). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§5, §7), `docs/design-guide.md`, `src/partials/footer.html`, `src/partials/scripts-base.html`, `styles.css`.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S19 — done (страница политики существует). S32 — done (метрика реально стоит; без неё уведомление преждевременно).

## 4. Затрагиваемые файлы
- `src/partials/footer.html` (разметка плашки — в конец партиала, чтобы была на всех страницах)
- `styles.css` (стили `.cookie-note`)
- `src/partials/scripts-base.html` (показ/скрытие + localStorage)
- `src/pages/politika-konfidencialnosti.html` (дополнить раздел «Какие данные собираем» упоминанием cookie/Метрики, если не сделано в S32)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. Разметка (в конец footer.html): компактная фиксированная плашка снизу-слева:
   ```html
   <div class="cookie-note" id="cookie-note" hidden>
     <p>Сайт использует cookie и Яндекс.Метрику для статистики. Подробнее — в <a href="/politika-konfidencialnosti">политике конфиденциальности</a>.</p>
     <button class="btn btn--sm" type="button" id="cookie-ok">Понятно</button>
   </div>
   ```
2. Стили: `position:fixed;left:24px;bottom:24px;max-width:360px;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:18px;z-index:150;` текст 14px muted; на ≤480px — на всю ширину с отступами 12px. Появление — лёгкий fade внутри `@media (prefers-reduced-motion:no-preference)`.
3. JS (новый IIFE в scripts-base): если `localStorage.getItem('knuhov_cookie_ok')` нет — снять `hidden`; по клику «Понятно» — `localStorage.setItem('knuhov_cookie_ok','1')`, скрыть. Это уведомление, не consent-гейт: метрика работает независимо (модель «уведомили и продолжаем» — стандарт РФ; если владелец захочет жёсткий opt-in, это отдельное решение).
4. Плашка не должна перекрывать CTA и попап диагностики (z-index попапа 200 — выше; проверь мобильный вид с открытым меню S16).
5. `node build.js`.

## 6. Definition of Done
- [ ] Первый визит: плашка видна на любой странице; «Понятно» скрывает навсегда (localStorage).
- [ ] Ссылка на политику работает; политика упоминает cookie/Метрику.
- [ ] Плашка не конфликтует с попапом, мобильным меню и CTA; ч/б стиль.

## 7. Как проверить локально
`node build.js`; `npx serve .` → инкогнито: плашка есть, клик — исчезла, перезагрузка — не появляется; `localStorage.removeItem('knuhov_cookie_ok')` — появляется снова; проверить 375px и открытый попап теста.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S33: cookie-уведомление`. Обновить `docs/plan/STATE.md` (S33 → done, Журнал). Остановиться.
