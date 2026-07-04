# S01 — vercel.json (cleanUrls) + чистые внутренние URL

## 1. Цель
Убрать `.html` из адресов сайта: включить `cleanUrls` на Vercel и перевести все внутренние ссылки на чистые URL (`/uslugi` вместо `/uslugi.html`). Фундамент для canonical, sitemap и всей дальнейшей SEO-работы.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (медицинский консалтинг Ислама Кнухова; аудитория — собственники клиник РФ). Плоский HTML/CSS/JS без фреймворка. Страницы собираются командой `node build.js` из `src/pages/*.html` + `src/partials/{header,footer,scripts-base}.html`; каталог услуг и страницы `/usluga-*.html` генерируются из массива `SERVICES` в `build.js`. Корневые `*.html` — артефакты сборки, руками не править. Хостинг — Vercel.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md`, `docs/design-guide.md`, `build.js`, `src/partials/header.html`, `src/partials/footer.html`, все `src/pages/*.html`.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет (первый шаг плана). Проверь в `docs/plan/STATE.md`, что шаг не выполнен.

## 4. Затрагиваемые файлы
- `vercel.json` (создать в корне)
- `src/partials/header.html`, `src/partials/footer.html`
- `src/pages/index.html`, `uslugi.html`, `diagnostika.html`, `contacts.html`, `cases.html`, `case-1.html`, `case-2.html`
- `build.js` (ссылки внутри `SERVICES[].href`, `serviceHref()`, `servicePageMain()` — кнопка «Оставить заявку», карточные ссылки)
- корневые `*.html` — пересоберутся автоматически

## 5. Точные инструкции
1. Создай `vercel.json` в корне:
   ```json
   {
     "cleanUrls": true,
     "trailingSlash": false
   }
   ```
2. Замени внутренние ссылки во всех перечисленных исходниках по карте: `/index.html#top` → `/#top` (в логотипе и футере), `/index.html` → `/`, `/uslugi.html` → `/uslugi` (включая варианты с `#diagnostika|#soprovozhdenie|#tehnicheskie`), `/diagnostika.html` → `/diagnostika` (включая `#audit-card`), `/cases.html` → `/cases`, `/case-1.html` → `/case-1`, `/case-2.html` → `/case-2`, `/contacts.html` → `/contacts`, `/usluga-<slug>.html` → `/usluga-<slug>`.
3. В `build.js`: в `SERVICES` два `href` на diagnostika (`/diagnostika.html` → `/diagnostika`, `/diagnostika.html#audit-card` → `/diagnostika#audit-card`); в `serviceHref()` убери `.html` из генерируемого пути (`'/usluga-' + s.slug`); в `servicePageMain()` ссылку `/contacts.html` → `/contacts`. Имена ЗАПИСЫВАЕМЫХ файлов (`fs.writeFileSync(... 'usluga-' + s.slug + '.html')`) НЕ трогай — на диске файлы остаются с `.html`, cleanUrls обслуживает их без расширения.
4. Проверь, что нигде в `src/` не осталось `href` с `.html`: `grep -rn '\.html"' src/ build.js` — допустимы только пути записи файлов в build.js.
5. `node build.js`.

## 6. Definition of Done
- [ ] `vercel.json` существует с `cleanUrls: true`.
- [ ] `grep -rn 'href="[^"]*\.html' src/ *.html` не находит внутренних ссылок с `.html` (внешние URL, если появятся, не в счёт).
- [ ] Сборка проходит, все страницы пересобраны.
- [ ] Навигация шапки/футера, карточки каталога, CTA-кнопки ведут на чистые URL.

## 7. Как проверить локально
`node build.js`, затем `npx vercel dev` из корня (эмулирует cleanUrls; обычный статик-сервер расширения не спрячет) — или, если vercel dev недоступен, `npx serve .` и проверить только корректность href в разметке. Пройти: шапка → все 4 пункта, футер, карточки /uslugi, страница услуги → «Оставить заявку», /diagnostika → «Заказать аудит».

## 8. Деплой
По умолчанию НЕ деплоить: изменения копятся и уходят пачкой по команде владельца «пуш». Если владелец явно скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S01: чистые URL + vercel.json`. Обновить `docs/plan/STATE.md` (S01 → done, заметка, Журнал, «Следующий шаг»). Остановиться.
