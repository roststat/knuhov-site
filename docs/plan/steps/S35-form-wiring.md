# S35 — Подключение формы контактов к бэкенду

## 1. Цель
Форма на /contacts начинает реально отправлять заявки в `/api/lead` (S34): клиентская валидация, обязательное согласие, honeypot, передача результата диагностики, честные состояния «отправляется/успех/ошибка».

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг». Плоский HTML/CSS/JS, сборка `node build.js`. Форма: `src/pages/contacts.html` — поля `#f-name`, `#f-contact`, `#f-message`, чекбокс `#f-consent`, кнопка `#f-submit` (type=button), блок `#f-thanks`; текущий скрипт в `<!--SCRIPTS-->` только показывает «спасибо» и зовёт `window.track('contact_form_submitted')`. Результат диагностики может лежать в `sessionStorage['knuhov_diagnostic_attached']` (JSON, кладёт чекбокс на /diagnostika). Бэкенд: POST `/api/lead` (S34) — JSON `{name, contact, message, diagnostic, consent, website(honeypot)}`; 200 `{ok:true}` | 400.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§8), `api/lead.js` (фактический контракт!), `src/pages/contacts.html`, `src/pages/diagnostika.html` (механика attach), `styles.css` (`.field`, `.consent`, `.thanks`).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S34 — done (эндпоинт существует, контракт известен). S19 — done (текст согласия ссылается на политику).

## 4. Затрагиваемые файлы
- `src/pages/contacts.html` (разметка формы + скрипт)
- `styles.css` (состояния ошибок полей, если нужного стиля нет)
- корневой `contacts.html` — пересборка

## 5. Точные инструкции
1. Разметка: оберни поля в `<form id="lead-form" novalidate>`; `#f-message` сделай `<textarea rows="4">` (сейчас это однострочный input); добавь `required` к name/contact/consent; добавь honeypot: `<input type="text" name="website" id="f-website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">`; кнопку `type="submit"`. Если в sessionStorage есть диагностика — покажи над кнопкой строку «К заявке будет прикреплён результат диагностики: {system_type}» (мелкий muted-текст) — честность о передаваемых данных.
2. Скрипт (заменить текущий IIFE): на `submit` — preventDefault; валидация: имя и контакт непустые, согласие отмечено — иначе подсветить поле (класс `.field--error` с рамкой 2px var(--ink) + текст подсказки, ч/б) и `focus()` в первое невалидное; собрать payload (+`diagnostic` из sessionStorage, +`website` honeypot); `fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})`; на время запроса кнопка `disabled` + текст «Отправляем…»; при `ok` — скрыть форму, показать `#f-thanks` (добавь `aria-live="polite"` на блок), `window.track('contact_form_submitted',{diagnostic_attached:!!diagnostic})`, очистить sessionStorage-ключ; при ошибке сети/4xx — вернуть кнопку, показать под ней «Не получилось отправить — напишите нам напрямую: {контакт из S18}» + `window.track('contact_form_error',{status})`.
3. ES5-стиль кодовой базы соблюдать (fetch допустим — базовая поддержка повсеместна; async/await не использовать, then-цепочки).
4. `node build.js`.

## 6. Definition of Done
- [ ] Пустая форма не отправляется: видимая подсветка + фокус; согласие обязательно.
- [ ] Успешная отправка: заявка в хранилище, «спасибо»-блок, событие в track.
- [ ] Ошибка бэкенда обрабатывается честно (нет ложного «принята»).
- [ ] Результат диагностики прикрепляется, и пользователь об этом предупреждён.
- [ ] Honeypot невидим и не ловится табом.

## 7. Как проверить локально
`vercel dev` (нужен для /api) → `/contacts`: сценарии — пустая форма; без согласия; валидная (проверить запись в хранилище); с пройденным тестом на /diagnostika + чекбокс attach; отключить сеть → ошибка. Проверить 375px и Tab-порядок.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S35: форма контактов подключена к бэкенду`. Обновить `docs/plan/STATE.md` (S35 → done, Журнал). Остановиться.
