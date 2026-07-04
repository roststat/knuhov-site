# S10 — JSON-LD: Service + BreadcrumbList на страницах услуг

## 1. Цель
Разметить каждую из 11 страниц `/usluga-*` как Service (с привязкой к организации) и BreadcrumbList — данные берутся из массива `SERVICES`, поэтому новые услуги размечаются автоматически.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (консалтинг для клиник). Плоский HTML/CSS/JS. `node build.js` генерирует страницы услуг из массива `SERVICES` (поля: cat, slug, title, teaser, pain, includes, forWhom) функцией `servicePageMain(s)`; категории — массив `CATEGORIES` (Диагностика/Сопровождение/Технические работы), подпись категории даёт `catLabel(s.cat)`. Сквозной JSON-LD Organization уже печатается шаблоном (S09, `@id: https://knuhov.ru/#org`). Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§6), `build.js` целиком (особенно цикл `for (const s of SERVICES)` в конце).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S09 — done (`SITE_URL`, базовый JSON-LD, `@id` организации).

## 4. Затрагиваемые файлы
- `build.js` (функция `serviceJSONLD(s)`, вставка в сборку страниц услуг)
- корневые `usluga-*.html` — пересборка

## 5. Точные инструкции
1. В `build.js` добавь:
   ```js
   function serviceJSONLD(s) {
     const url = SITE_URL + '/usluga-' + s.slug;
     return {
       '@context': 'https://schema.org',
       '@graph': [
         { '@type': 'Service', '@id': url + '#service',
           name: s.title, description: s.seoDescription || s.teaser,
           serviceType: catLabel(s.cat), url: url,
           provider: { '@id': SITE_URL + '/#org' }, areaServed: 'RU' },
         { '@type': 'BreadcrumbList',
           itemListElement: [
             { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL + '/' },
             { '@type': 'ListItem', position: 2, name: 'Услуги', item: SITE_URL + '/uslugi' },
             { '@type': 'ListItem', position: 3, name: catLabel(s.cat), item: SITE_URL + '/uslugi#' + s.cat },
             { '@type': 'ListItem', position: 4, name: s.title }
           ] }
       ]
     };
   }
   ```
   Цену НЕ размечай (`offers`) — на страницах услуг цена «обсуждается индивидуально»; врать разметкой нельзя.
2. Вставка: в цикле генерации услуг передавай дополнительный скрипт — либо расширь `assemble()` параметром `extraHead`, либо припиши `<script type="application/ld+json">…</script>` к аргументу `scripts` (он вставляется перед `</body>` — для JSON-LD это допустимо). Выбери способ, согласованный с тем, как S09 вставил базовый блок.
3. `node build.js`; проверь `usluga-crm.html`: два JSON-LD блока (базовый + сервисный), оба валидны.

## 6. Definition of Done
- [ ] На каждой `/usluga-*` странице есть Service + BreadcrumbList с корректными url/именами из данных.
- [ ] На остальных страницах сервисной разметки нет.
- [ ] JSON валиден; нет offers/цен в разметке.

## 7. Как проверить локально
`node build.js`; `grep -c 'ld+json' usluga-crm.html` → 2; `grep -c 'BreadcrumbList' *.html` — ровно 11 совпадений (по числу услуг со slug); распарсить JSON node-скриптом как в S09.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S10: JSON-LD Service + BreadcrumbList для услуг`. Обновить `docs/plan/STATE.md` (S10 → done, Журнал). Остановиться.
