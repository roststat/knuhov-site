# S32 — Яндекс.Метрика + цели по существующим событиям

## 1. Цель
Подключить Я.Метрику и превратить уже размеченные события `window.track()` в цели — сайт начнёт измерять воронку (тест → результат → CTA аудита → заявка). Без этого контентные и SEO-шаги летят вслепую.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js`. Слой аналитики уже есть: `window.track(name,payload)` в `src/partials/scripts-base.html` (~строки 3–9) пушит в `dataLayer`. События уже расставлены по коду: `diagnostic_start`, `diagnostic_step_answered`, `diagnostic_completed`, `diagnostic_restarted`, `audit_cta_clicked`, `diagnostic_share_clicked`, `diagnostic_share_completed`, `diagnostic_pdf_clicked`, `diagnostic_pdf_generated`, `diagnostic_attached_to_audit`, `diagnostic_removed_from_audit`, `contact_form_submitted` (см. `src/pages/diagnostika.html` и `contacts.html`). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§8), `src/partials/scripts-base.html`, `grep -rn "window.track(" src/` (полный список событий на момент выполнения).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
**Нужен от владельца:** номер счётчика Метрики (или согласие создать новый на его аккаунте — тогда создание счётчика делает владелец, шаг получает ID). Без ID не выполнять.

## 4. Затрагиваемые файлы
- `src/partials/scripts-base.html` (код счётчика + доработка `track()`)
- корневые `*.html` — пересборка
- (после выполнения — напомнить про S19: дополнить политику разделом про метрику, и S33: cookie-уведомление)

## 5. Точные инструкции
1. В начало `scripts-base.html` вставь официальный тег Метрики (ID владельца), параметры инициализации: `clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:false` (вебвизор не включать без явного решения владельца — это влияет на текст политики/уведомления).
2. Доработай `track()` — после пуша в dataLayer добавь:
   ```js
   if(typeof ym==='function')ym(METRIKA_ID,'reachGoal',name,payload||{});
   ```
   (`METRIKA_ID` — константа рядом; события уходят целями с теми же именами).
3. В интерфейсе Метрики (это делает владелец по твоей инструкции, либо ты через его доступ) создай JS-цели с именами ключевых событий: `diagnostic_start`, `diagnostic_completed`, `audit_cta_clicked`, `contact_form_submitted` (+ составную «воронка диагностики»). Остальные события останутся видны как параметры визитов/цели добавятся позже. Приложи в STATE список созданных целей.
4. `node build.js`. Учти: локально события уйдут на реальный счётчик — при проверке используй фильтр по IP или просто проверь консоль (`[track]`-debug лог) и Network-запросы `mc.yandex.ru`.

## 6. Definition of Done
- [ ] Счётчик грузится на всех страницах; `ym` доступен.
- [ ] Прохождение теста локально порождает reachGoal-запросы (Network: `mc.yandex.ru/watch/.../reachGoal`).
- [ ] Вебвизор выключен (или включён по явному решению владельца — зафиксировать).
- [ ] STATE содержит ID счётчика и список целей.

## 7. Как проверить локально
`node build.js`; `npx serve .` → пройти тест на `/diagnostika` с открытым Network (фильтр yandex); проверить `contact_form_submitted` на `/contacts`; console.debug `[track]` продолжает логировать.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`. Проверку целей в интерфейсе Метрики делать после реального деплоя.

## 9. Финализация
Коммит `S32: Яндекс.Метрика + цели`. Обновить `docs/plan/STATE.md` (S32 → done + ID/цели, Журнал; пометить S19/S33 как «требуют дополнения про метрику»). Остановиться.
