# S34 — Бэкенд формы заявки (serverless-эндпоинт + хранилище)

## 1. Цель
Сейчас форма контактов показывает «Заявка принята», но данные никуда не уходят — заявки теряются. Создать серверную часть: эндпоинт на Vercel + запись заявки в хранилище. Подключение фронтенда — отдельный шаг S35.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг», хостится на Vercel (проект knuhov-site; `.vercel/project.json` в репо). Плоский HTML без фреймворка; Vercel Serverless Functions работают и на статических проектах: файл `api/<name>.js` в корне репо становится эндпоинтом `/api/<name>` (Node runtime, `module.exports = (req,res)=>{...}`). Форма (`src/pages/contacts.html`): имя, контакт (Telegram/телефон), сообщение, чекбокс согласия; плюс в `sessionStorage` может лежать результат диагностики (`knuhov_diagnostic_attached` — JSON с типом системы и слабыми слоями, см. `src/pages/diagnostika.html`). ТЗ (docs/TZ.md §11): заявки писать в БД (Supabase / Vercel Postgres / VPS — у владельца есть VPS в РФ), внешние уведомления (Telegram/почта) — позже; ПДн хранить на подконтрольной инфраструктуре, не класть в URL.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md`, `docs/TZ.md` (§11), `src/pages/contacts.html`, `src/pages/diagnostika.html` (блок attach), `vercel.json`.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
**Нужно решение владельца по хранилищу** (варианты с trade-off: Vercel Postgres — проще всего, данные вне РФ; Supabase — то же; таблица/эндпоинт на его VPS (85.198.65.184, РФ) — лучше для 152-ФЗ, чуть больше работы). До решения — blocked. Также понадобятся секреты (connection string / токен) — задать через `vercel env add`, НЕ коммитить.

## 4. Затрагиваемые файлы
- `api/lead.js` (создать)
- `package.json` (создать, если для драйвера БД нужна зависимость; Vercel поставит сам)
- `.gitignore` (убедиться: `.env*` игнорируется — добавить строку `.env*`)
- env-переменные Vercel (вне git)

## 5. Точные инструкции
1. Спроектируй запись заявки: `{name, contact, message, diagnostic (json|null), consent:true, created_at, source (путь страницы), user_agent}`. В URL/логи ПДн не писать.
2. `api/lead.js`: принимает только POST с JSON; валидация: `name` и `contact` непустые (труба ≤ 200 символов), `consent === true` обязательно; `message` ≤ 2000; `diagnostic` — опциональный объект (сохранять как JSON-строку). Ответы: 200 `{ok:true}`, 400 с кодом ошибки, 405 на не-POST. Анти-спам-минимум: honeypot-поле `website` (если непустое — ответить 200, но не сохранять) + отсечка по длине. CORS не нужен (same-origin).
3. Запись в хранилище по решению владельца: (а) Vercel/Neon Postgres — `CREATE TABLE leads (...)`, драйвер `@vercel/postgres` или `pg`; (б) Supabase — REST-вставка через service-role ключ из env; (в) VPS — форвард POST'ом на защищённый эндпоинт VPS с токеном из env. Схему/SQL приложи в комментарии файла.
4. Секреты — только `process.env.*`; локально проверка через `vercel dev` и `.env.local` (в git не попадает).
5. Тест локально: `vercel dev` → `curl -X POST localhost:3000/api/lead -H 'Content-Type: application/json' -d '{"name":"Тест","contact":"@test","consent":true}'` → 200 и строка в хранилище; невалидные варианты → 400.

## 6. Definition of Done
- [ ] POST /api/lead валидирует и сохраняет заявку; невалидное/не-POST отклоняется корректными кодами.
- [ ] Согласие обязательно на уровне бэкенда; honeypot работает.
- [ ] Секретов в git нет (`git diff --staged | grep -i 'key\|token\|postgres://'` — пусто).
- [ ] Решение по хранилищу и схема зафиксированы в STATE.

## 7. Как проверить локально
`vercel dev` + curl-сценарии из п. 5.5 (валидный / без consent / GET / honeypot); убедиться, что запись реально появилась в хранилище.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes` (env-переменные добавить в Vercel до деплоя: `vercel env add`).

## 9. Финализация
Коммит `S34: serverless-эндпоинт заявок`. Обновить `docs/plan/STATE.md` (S34 → done + заметка о хранилище, Журнал; напомнить: S19 — уточнить раздел «Хранение» политики). Остановиться.
