Backend API (Users & Items Marketplace)

REST API сервер для маркетплейсу предметів з підтримкою автентифікації, авторизації та тестування.

 Функціональність

 - Реєстрація та вхід користувачів (JWT)
 - Захищені ендпоінти
 - CRUD для користувачів та предметів
 - Купівля предметів між користувачами

 Бізнес-правила:

 - тільки Admin може створювати предмети
 - ціна предмета не може бути від’ємною
 - коректна залежність Type / Weapon

 Інваріанти та валідація даних
 - Unit + Integration тести

 Технології

 - Node.js
 - Express
 - TypeScript
 - Prisma ORM
 - PostgreSQL
 - JWT (jsonwebtoken)
 - bcryptjs
 - Jest + Supertest

 Встановлення

   npm install

  Змінні середовища
   Створи файл .env:
     DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
     JWT_SECRET="supersecret"

  Prisma
   Згенерувати клієнт:
     npx prisma generate

   Запуск сервера
     npm run dev
   або
     npm start

  Тести

   Запустити всі тести:
     npm test

   Тільки unit-тести:
     npm run test:unit

   Тільки integration-тести:
     npm run test:integration

 Автентифікація

   Реєстрація
     POST /auth/register
     {
       "email": "test@example.com",
       "password": "123456",
       "username": "testuser"
    }
 
   Вхід
    POST /auth/login
    {
        "email": "test@example.com",
        "password": "123456"
    }
  Відповідь:
    {
        "token": "...",
         "user": { ... }
    }

   Використання токена
      Authorization: Bearer <token>

 Admin

    У системі існує користувач Admin.
    тільки він може створювати предмети (POST /items)
    Визначається за username === "Admin"

 API
  Users
   Метод	   Endpoint	Опис
   GET	   /users		список користувачів
   GET	   /users/:id		отримати користувача
   PUT	   /users/:id		оновити користувача
   DELETE  /users/:id		архівувати користувача
         
  Items  

 Метод		Endpoint	Опис
  GET		/items		список предметів
  GET		/items/:id	отримати предмет
  POST		/items		створити предмет (тільки Admin)
  POST          /items/:id/buy  купити предмет 
  PUT		/items/:id	оновити предмет
  DELETE	/items/:id	видалити предмет
 
 Помилки
  Код	   Значення
  400	   Невалідні дані
  401	   Неавторизований
  403	   Заборонено (не Admin)
  404	   Не знайдено
  409	   Конфлікт
           
 Інваріанти
   Users
  - email повинен бути валідним і унікальним
  - username не може бути порожнім
  
  - balance не може бути від’ємним
  - password зберігається тільки у вигляді хешу

  Items

  - price ≥ 0
  - OwnerID повинен існувати
  - якщо Type = 1 то Weapon обов’язковий
  - користувач не може купити власний предмет
  - баланс користувача не може стати від’ємним після покупки  
  - операція покупки виконується в межах транзакції
  - після покупки змінюється власник предмета  
  - якщо Type != 1 то Weapon має бути null

  Тестування

    Unit-тести

     Перевіряють:
     - валідацію email
     - username
     - price
     - операцію покупки предмета

   правило Type / Weapon

  Integration-тести
   Перевіряють:
     - auth API
     - роботу з базою даних
     - захищені ендпоінти

 Структура проекту

   src/
      prisma.ts
      app.ts
      auth/
         admin.middleware.ts
         auth.middleware.ts 
         auth.routes.ts     
         auth.service.ts    
      users/
         users.routes.ts    
         users.service.ts   
         users.validation.ts
      items/
         items.routes.ts         
         items.service.ts        
         items.validation.ts     
      utils/
         error.ts
         hash.ts
         jwt.ts
  tests/
     auth.test.ts
     items.test.ts
      unit/
         items.validation.test.ts 
         users.validation.test.ts 

   Додатково
  Use cases: docs/use-cases.md
  Архітектура підготовлена до layered architecture та CQRS