# АРМ Автослужба — MVP

Система учёта путевых листов и топлива. Стек: **Nuxt.js 3 + PostgreSQL + Prisma + Tailwind CSS**.

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить базу данных

Создайте БД в PostgreSQL:
```sql
CREATE DATABASE waybill_mvp;
```

### 3. Создать `.env` файл

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/waybill_mvp"
JWT_SECRET="придумайте-секретный-ключ"
```

### 4. Применить миграции и заполнить данными

```bash
npm run db:migrate
npm run db:seed
```

### 5. Запустить

```bash
npm run dev
```

Откройте http://localhost:3000

---

## Тестовые учётные записи

| Email                    | Пароль      | Роль           |
|--------------------------|-------------|----------------|
| superadmin@mil.local     | Admin1234!  | Супер Админ    |
| admin@mil.local          | Admin1234!  | Администратор  |
| dispatcher@mil.local     | Admin1234!  | Диспетчер      |
| driver@mil.local         | Admin1234!  | Водитель       |

---

## Структура проекта

```
├── prisma/
│   ├── schema.prisma      # Схема БД
│   └── seed.js            # Тестовые данные
├── server/
│   ├── api/               # API эндпоинты
│   │   ├── auth/          # Авторизация
│   │   ├── cars/          # Автомобили
│   │   ├── drivers/       # Водители
│   │   ├── waybills/      # Путевые листы
│   │   ├── fuel/          # Топливо
│   │   ├── maintenance/   # ТО
│   │   ├── reports/       # Отчёты
│   │   └── users/         # Пользователи
│   └── utils/             # Утилиты (auth, prisma, maintenance)
├── pages/                 # Страницы Vue
├── composables/           # useAuth.ts
├── middleware/            # auth.global.ts
├── layouts/               # default.vue, auth.vue
└── assets/css/main.css    # Глобальные стили
```

## Роли и права

| Функция                  | Супер Админ | Админ | Диспетчер | Водитель |
|--------------------------|:-----------:|:-----:|:---------:|:--------:|
| Управление пользователями| ✓           | ✗     | ✗         | ✗        |
| Управление авто/водителями| ✓          | ✓     | ✗         | ✗        |
| Создание путевых листов  | ✓           | ✓     | ✓         | ✗        |
| Учёт топлива             | ✓           | ✓     | ✓         | ✗        |
| Запись ТО                | ✓           | ✓     | ✓         | ✗        |
| Просмотр своих листов    | ✓           | ✓     | ✓         | ✓        |
| Отчёты                   | ✓           | ✓     | ✗         | ✗        |

## Полезные команды

```bash
npm run db:studio    # Открыть Prisma Studio (UI для БД)
npm run db:reset     # Сбросить БД и пересеять данные
npm run build        # Продакшн сборка
```
