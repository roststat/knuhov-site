# S09 — JSON-LD: Organization + Person + WebSite на все страницы

## 1. Цель
Дать поисковикам машиночитаемую сущность бренда: организация «Кнухов консалтинг», её основатель Ислам Кнухов, сайт. Единый блок JSON-LD печатается шаблоном сборки на каждой странице.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (медицинский консалтинг; эпонимный бренд Ислама Кнухова, основателя). Плоский HTML/CSS/JS. `<head>` печатает шаблон `HEAD` в `build.js`; сквозные вещи добавляются туда, не в страницы. Канонический хост `https://knuhov.ru`. Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§6 — @id-константы и правило «не размечать то, чего нет»), `build.js`, `docs/TZ.md` (§1 — позиционирование: «стратег по развитию медицинских проектов», НЕ «агентство»).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S04 — done (в build.js уже есть `SITE_URL`; JSON-LD ссылается на canonical-URL).

## 4. Затрагиваемые файлы
- `build.js` (константа с JSON-LD, вставка в `HEAD` или перед `</head>`)
- корневые `*.html` — пересборка

## 5. Точные инструкции
1. В `build.js` собери объект (сериализуй через `JSON.stringify`, не руками):
   ```js
   const BASE_JSONLD = {
     '@context': 'https://schema.org',
     '@graph': [
       { '@type': 'ProfessionalService', '@id': SITE_URL + '/#org',
         name: 'Кнухов консалтинг', url: SITE_URL + '/',
         description: 'Консалтинг для медицинского бизнеса: диагностика, сопровождение и техническая настройка роста выручки клиник.',
         founder: { '@id': SITE_URL + '/#islam' },
         areaServed: 'RU', knowsAbout: ['медицинский маркетинг', 'управление клиникой', 'CRM для клиник', 'аналитика медицинского бизнеса'] },
       { '@type': 'Person', '@id': SITE_URL + '/#islam',
         name: 'Ислам Кнухов',
         jobTitle: 'Стратег по развитию медицинских проектов',
         worksFor: { '@id': SITE_URL + '/#org' },
         image: SITE_URL + '/assets/islam.jpg' },
       { '@type': 'WebSite', '@id': SITE_URL + '/#website',
         url: SITE_URL + '/', name: 'Кнухов консалтинг',
         inLanguage: 'ru-RU', publisher: { '@id': SITE_URL + '/#org' } }
     ]
   };
   ```
   НЕ добавляй: адрес, телефон, email, sameAs-соцсети, рейтинги — пока владелец не дал реальные данные (шаг S18 дополнит `telephone`, `email`, `address`, `sameAs`).
2. В шаблон `HEAD` перед `</head>` добавь `<script type="application/ld+json">${JSON.stringify(BASE_JSONLD)}</script>`.
3. `node build.js`.
4. Валидация: скопируй содержимое скрипта из собранного `index.html` в https://validator.schema.org/ (или проверь глазами структуру, если офлайн: валидный JSON, все @id согласованы).

## 6. Definition of Done
- [ ] На каждой собранной странице один `<script type="application/ld+json">` с @graph из 3 сущностей.
- [ ] JSON валиден (`node -e "JSON.parse(...)"` или валидатор schema.org).
- [ ] Нет выдуманных данных (телефонов, адресов, соцсетей).

## 7. Как проверить локально
`node build.js`; `grep -c 'application/ld+json' *.html` — по 1 на страницу; извлечь JSON и распарсить: `node -e "const m=require('fs').readFileSync('index.html','utf8').match(/ld\+json\">(.*?)<\/script>/s); JSON.parse(m[1]); console.log('OK')"`.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S09: JSON-LD Organization/Person/WebSite`. Обновить `docs/plan/STATE.md` (S09 → done, Журнал). Остановиться.
