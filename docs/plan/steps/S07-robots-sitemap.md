# S07 — robots.txt + автогенерация sitemap.xml в build.js

## 1. Цель
Дать Яндексу и Google карту сайта и правила обхода. Sitemap генерируется сборкой из единого источника правды (список страниц + `SERVICES`), чтобы новые услуги попадали в него автоматически.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (консалтинг для клиник; SEO-приоритет — Яндекс + Google). Плоский HTML/CSS/JS. `node build.js` собирает страницы из `src/pages/*.html` и генерирует `/usluga-<slug>.html` из массива `SERVICES` (услуги без `slug`, с `href`, своей страницы не имеют). Корневые файлы раздаются Vercel как есть; включён `cleanUrls` (S01) — канонические URL без `.html`, хост `https://knuhov.ru`.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md` (§3, §6), `build.js` целиком, `vercel.json`.
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
S01 — done (URL в sitemap должны быть чистыми). Желательно S06 (noindex кейсов — их надо исключить из sitemap).

## 4. Затрагиваемые файлы
- `robots.txt` (создать в корне, статический)
- `build.js` (функция генерации sitemap в конце сборки)
- `sitemap.xml` (артефакт сборки в корне)

## 5. Точные инструкции
1. `robots.txt`:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://knuhov.ru/sitemap.xml
   ```
2. В `build.js` после обоих циклов сборки добавь генерацию sitemap. Собирай список URL из: страниц `src/pages/*.html` за вычетом исключений + всех услуг со `slug`. Исключения: `404.html`; страницы с noindex (сейчас `case-1`, `case-2` — см. S06; если механизм noindex реализован маркером, исключай по нему, а не по хардкоду имён). Используй `SITE_URL` и `canonicalPath()` из S04; если S04 ещё не сделан — заведи их здесь тем же способом.
   ```js
   function sitemapXML(urls) {
     const today = new Date().toISOString().slice(0, 10);
     return '<?xml version="1.0" encoding="UTF-8"?>\n' +
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
       urls.map(u => '  <url><loc>' + SITE_URL + u + '</loc><lastmod>' + today + '</lastmod></url>').join('\n') +
       '\n</urlset>\n';
   }
   fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXML(urls));
   console.log('built sitemap.xml (' + urls.length + ' urls)');
   ```
3. `node build.js`; открой `sitemap.xml`, проверь состав: `/`, `/uslugi`, `/diagnostika`, `/cases`, `/contacts`, 11 × `/usluga-*` — и НЕТ `/404`, `/case-1`, `/case-2`.

## 6. Definition of Done
- [ ] `robots.txt` в корне со ссылкой на sitemap.
- [ ] `sitemap.xml` генерируется сборкой; URL чистые, абсолютные, с lastmod.
- [ ] Исключены 404 и noindex-страницы.
- [ ] Повторный запуск `node build.js` идемпотентен (кроме lastmod).

## 7. Как проверить локально
`node build.js`; `xmllint --noout sitemap.xml` (или открыть в браузере — XML без ошибок); сверить список URL с фактическим набором страниц: `ls *.html`.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`. Отправка sitemap в Вебмастер/GSC — отдельный шаг S36, только после деплоя.

## 9. Финализация
Коммит `S07: robots.txt + генерация sitemap.xml`. Обновить `docs/plan/STATE.md` (S07 → done, Журнал). Остановиться.
