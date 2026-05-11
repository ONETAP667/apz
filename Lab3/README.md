# Lab 2 refactor template

Це готовий каркас для рефакторингу першої лабораторної під вимоги другої лабораторної.

## Що всередині

- `src/domain` — доменні моделі, value objects, доменні помилки, repository interfaces.
- `src/application` — use cases.
- `src/infrastructure` — Prisma repositories, mappers, bcrypt, JWT.
- `src/presentation` — Express routes, middleware, error mapper.
- `src/composition` — ручний DI container.
- `tests/unit` — приклади unit-тестів домену та application layer без БД/HTTP.
- `docs/adr/0001-domain-model.md` — ADR з вибором Rich Domain Model.
- `docs/analysis/lab2.md` — аналіз для здачі.

## Як інтегрувати

1. Перенести папки у ваш проєкт.
2. Оновити entrypoint у `package.json`, наприклад:

```json
{
  "main": "dist/presentation/http/server.js",
  "scripts": {
    "dev": "ts-node-dev src/presentation/http/server.ts",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

3. Перевірити назви моделей Prisma. У шаблоні використано ті самі назви, що були у першій лабі: `users`, `items`, `ID`, `Username`, `Balance`, `OwnerID`, `Price`, `Type`, `Weapon`.
4. За потреби перенести старі integration tests і змінити імпорт app на:

```ts
import { createApp } from "../src/presentation/http/app";
import { prisma } from "../src/infrastructure/prisma/prisma";
```


## Враховано актуальну версію Lab 1

У вашій останній версії першої лабораторної Admin не створюється в тесті як звичайний користувач, а має існувати після розгортання БД через `sql/add_start_data.sql`:

- email: `Admin@mail.test`
- username: `Admin`
- password для тестів: `admin123`

Тому в оновленому шаблоні:

1. `prisma/schema.prisma` і `sql/*.sql` додані в архів.
2. `requireAdmin` перевіряє username case-insensitive: `username.toLowerCase() === "admin"`.
3. Integration-тести мають helper `ensureAdmin()`: якщо seed не був виконаний, тест створить Admin сам, але основний сценарій все одно сумісний із deploy-time seed.
4. Після перенесення рефакторингу можна залишити ваш підхід: у реальному застосунку Admin створюється SQL seed-скриптом, а не через `/auth/register`.

## Команди перевірки після перенесення

```bash
npx prisma generate
npx tsc --noEmit
npm run test:unit
npm run test:integration
```

Для integration-тестів перед запуском переконайтесь, що seed виконаний:

```bash
psql "$DATABASE_URL" -f sql/add_start_data.sql
```

Якщо seed не запускався, тести все одно можуть створити Admin через `ensureAdmin()`, але для здачі краще показати саме deploy-time створення адміністратора.
