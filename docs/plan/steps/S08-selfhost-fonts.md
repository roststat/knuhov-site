# S08 — Самохостинг Space Grotesk (woff2 + preload)

## 1. Цель
Убрать зависимость от Google Fonts CDN (в РФ периодически деградирует, плюс блокирующий внешний CSS-запрос): раздавать Space Grotesk 400/500 со своего домена, ускорить LCP/FCP.

## 2. Контекст-бутстрап
Проект: knuhov.ru — статический сайт «Кнухов консалтинг» (аудитория — РФ). Плоский HTML/CSS/JS. Общий `<head>` печатает шаблон `HEAD` в `build.js` (~строка 126) — сейчас там 2 preconnect на Google Fonts и `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap">`. Единственный шрифт всего сайта — Space Grotesk 400 и 500 (design-guide §3), кириллица обязательна. Корневые `*.html` — артефакты сборки.
Прочитай первыми: `docs/plan/README.md`, `docs/plan/CONVENTIONS.md`, `docs/design-guide.md` (§3), `build.js`, `styles.css` (font-family упоминания).
Глоссарий: «пуш» (команда владельца) = git add+commit → `git push origin main` → `vercel --prod --yes`. Без команды «пуш» не деплоить.

## 3. Предусловия/зависимости
Нет.

## 4. Затрагиваемые файлы
- `assets/fonts/space-grotesk-400.woff2`, `assets/fonts/space-grotesk-500.woff2` (создать)
- `styles.css` (два `@font-face` в начало файла)
- `build.js` (шаблон `HEAD`: убрать Google Fonts, добавить preload)

## 5. Точные инструкции
1. Получи woff2 с кириллицей: скачай CSS Google Fonts с UA современного браузера и вытяни URL сабсетов latin + cyrillic для весов 400 и 500:
   `curl -A "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/120 Safari/537.36" "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500&display=swap"` → в ответе блоки `/* cyrillic */` и `/* latin */` с `url(...woff2)`. Скачай 4 файла и объедини ИЛИ проще: возьми полные (не сабсет) woff2 из официального репозитория шрифта (github.com/floriankarsten/space-grotesk, releases) — по одному файлу на вес. Итог: два woff2 в `assets/fonts/`, суммарно ориентировочно ≤ 120 КБ.
2. В начало `styles.css`:
   ```css
   @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:400;font-display:swap;
     src:url('/assets/fonts/space-grotesk-400.woff2') format('woff2')}
   @font-face{font-family:'Space Grotesk';font-style:normal;font-weight:500;font-display:swap;
     src:url('/assets/fonts/space-grotesk-500.woff2') format('woff2')}
   ```
3. В `build.js` из шаблона `HEAD` удали оба `preconnect` и `<link>` Google Fonts; добавь перед stylesheet:
   ```html
   <link rel="preload" href="/assets/fonts/space-grotesk-500.woff2" as="font" type="font/woff2" crossorigin>
   ```
   (preload только 500 — им набраны заголовки/навигация; 400 догрузится по swap.)
4. `node build.js`.
5. Проверь кириллицу: открой любую страницу локально, DevTools → Network → шрифт грузится с localhost, текст «Стратегический рост…» рендерится Space Grotesk (вкладка Computed → font-family), не системным фолбэком.

## 6. Definition of Done
- [ ] Ни одного запроса к `fonts.googleapis.com`/`fonts.gstatic.com` на любой странице.
- [ ] Кириллица и латиница рендерятся Space Grotesk в весах 400 и 500.
- [ ] `@font-face` с `font-display:swap`; preload 500-го веса в head всех страниц.

## 7. Как проверить локально
`node build.js`; `npx serve .`; DevTools → Network (фильтр font) на `/`, `/uslugi`, `/usluga-crm`; отключить сеть после первой загрузки и обновить — шрифт из кеша, без FOUT в системный.

## 8. Деплой
По умолчанию НЕ деплоить: изменения уходят пачкой по команде владельца «пуш». Если скомандовал: `git push origin main && vercel --prod --yes`.

## 9. Финализация
Коммит `S08: самохостинг Space Grotesk`. Обновить `docs/plan/STATE.md` (S08 → done, Журнал). Остановиться.
