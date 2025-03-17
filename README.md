# Altailands - Next.js проект

## Развертывание на сервере

### Предварительные требования

1. Установленный Docker и Docker Compose
```bash
sudo apt update
sudo apt install docker.io docker-compose git -y
```

2. SSL сертификаты для домена altailands.ru:
- certificate.crt
- certificate.key
- certificate_ca.crt

### Структура проекта

```
altailands/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── next.config.js
├── public/
│   └── uploads/        # Директория для загруженных файлов
├── ssl/
│   └── altailands.ru/  # Директория с SSL сертификатами
└── ... другие файлы проекта
```

### Шаги по развертыванию

1. Клонировать репозиторий:
```bash
cd /var/www
git clone [ваш-репозиторий] altailands
cd altailands
```

2. Создать необходимые директории:
```bash
# Создаем директорию для SSL сертификатов
mkdir -p ssl/altailands.ru

# Создаем директорию для загрузок
mkdir -p public/uploads
chmod 777 public/uploads
```

3. Скопировать SSL сертификаты в правильную директорию:
```bash
cp /path/to/certificate.crt ssl/altailands.ru/
cp /path/to/certificate.key ssl/altailands.ru/
cp /path/to/certificate_ca.crt ssl/altailands.ru/

# Установить правильные права доступа
chmod 644 ssl/altailands.ru/certificate.crt
chmod 644 ssl/altailands.ru/certificate_ca.crt
chmod 600 ssl/altailands.ru/certificate.key
```

4. Запустить проект:
```bash
# Остановить существующий nginx на сервере
sudo systemctl stop nginx
sudo systemctl disable nginx

# Запустить контейнеры
docker-compose up -d --build
```

### Проверка работоспособности

1. Проверить статус контейнеров:
```bash
docker-compose ps
```

2. Проверить логи:
```bash
docker-compose logs -f
```

3. Проверить доступность сайта:
- https://altailands.ru
- http://altailands.ru (должен редиректить на https)

### Конфигурация

#### Docker Compose
`docker-compose.yml` настроен для запуска двух сервисов:
- nextjs: Next.js приложение
- nginx: Веб-сервер с SSL

Важные volume монтирования:
- SSL сертификаты: `./ssl:/etc/nginx/ssl:ro`
- Загруженные файлы: `./public/uploads:/app/public/uploads`

#### Nginx
Основные настройки в `nginx.conf`:
- SSL конфигурация
- Проксирование запросов к Next.js
- Обработка загрузки файлов (максимальный размер 10MB)
- HTTP/2 поддержка

#### Next.js
Конфигурация в `next.config.js`:
- Поддержка загрузки изображений с домена altailands.ru
- Standalone режим для Docker
- Настройки серверных экшенов

### Обновление проекта

Для обновления проекта:
```bash
# Получить последние изменения
git pull

# Перезапустить контейнеры
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Решение проблем

1. Если возникают проблемы с правами доступа к uploads:
```bash
chmod 777 public/uploads
```

2. Если nginx не может найти сертификаты:
```bash
# Проверить наличие файлов
ls -la ssl/altailands.ru/

# Проверить права доступа
chmod 644 ssl/altailands.ru/certificate.crt
chmod 644 ssl/altailands.ru/certificate_ca.crt
chmod 600 ssl/altailands.ru/certificate.key
```

3. Для просмотра логов отдельных сервисов:
```bash
# Логи Next.js
docker-compose logs -f nextjs

# Логи Nginx
docker-compose logs -f nginx
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
