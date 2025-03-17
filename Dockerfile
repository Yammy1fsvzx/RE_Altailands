FROM node:18-alpine AS builder

WORKDIR /app

# Установка необходимых зависимостей для Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Генерация Prisma клиента
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Установка необходимых системных пакетов
RUN apk add --no-cache openssl

# Копируем необходимые файлы
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Копируем Prisma файлы
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Создаем директорию для загрузок и устанавливаем права
RUN mkdir -p /app/public/uploads && chmod 777 /app/public/uploads

EXPOSE 3000

CMD ["node", "server.js"] 