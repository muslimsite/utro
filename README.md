# Утро

Telegram-бот и Mini App для социального челленджа раннего подъёма. Каждый участник ставит личную цель —
во сколько хочет вставать — и отмечается каждый день, чтобы не потерять стрик. Можно создать группу с друзьями
или семьёй: у группы есть общий стрик, который держится, пока вовремя отмечаются все участники.

## Возможности MVP

- Личная цель подъёма (время + часовой пояс + окно опоздания)
- Ежедневная отметка («Я встал») с определением, успел вовремя или нет
- Личный стрик и стрик группы
- Группы по инвайт-коду: создать, вступить, выйти
- Напоминания от бота: в момент цели и за 15 минут до конца окна
- Уведомление группы, когда участник отметился

## Стек

- **Бот и API:** Node.js + TypeScript, [grammY](https://grammy.dev/) (бот), [Fastify](https://fastify.dev/) (HTTP API),
  [Prisma](https://www.prisma.io/) + SQLite (данные)
- **Mini App:** React + Vite

Монорепозиторий на npm workspaces: `apps/server` (бот + API + планировщик) и `apps/web` (Mini App).

## Подготовка

1. Создайте бота через [@BotFather](https://t.me/BotFather) и получите `BOT_TOKEN`.
2. Установите зависимости из корня репозитория:

   ```bash
   npm install
   ```

3. Настройте окружение сервера:

   ```bash
   cp apps/server/.env.example apps/server/.env
   # впишите BOT_TOKEN, остальные значения можно оставить по умолчанию
   ```

4. Накатите миграции базы данных:

   ```bash
   npm run prisma:migrate -w apps/server
   ```

5. (Опционально) настройте адрес API для Mini App:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

## Запуск в разработке

```bash
npm run dev:server   # бот + API на http://localhost:3000
npm run dev:web       # Mini App на http://localhost:5173
```

Локально Mini App можно открыть прямо в браузере: при `ALLOW_DEV_AUTH=true` сервер принимает заголовок
`x-dev-telegram-id` вместо проверки подписи Telegram, и веб-клиент использует его автоматически в dev-режиме.
**Никогда не включайте `ALLOW_DEV_AUTH` в продакшене** — это полностью отключает проверку подписи.

Чтобы открыть Mini App внутри настоящего Telegram, нужен публичный HTTPS-адрес (например, через
[ngrok](https://ngrok.com/) или аналогичный туннель) — пропишите его в `WEB_APP_URL` (для сервера) и в настройках
бота через @BotFather (Menu Button / Web App).

## Проверка типов

```bash
npm run typecheck
```

## Структура проекта

```
apps/
  server/   бот (grammY), HTTP API (Fastify), планировщик напоминаний (node-cron), Prisma-схема
  web/      Mini App (React + Vite)
```
