FROM node:22-bookworm-slim

# python3/make/g++ are a fallback in case no prebuilt binary matches this platform
# for better-sqlite3's native module.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/server/prisma apps/server/prisma
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY apps/server apps/server
WORKDIR /app/apps/server
RUN npx prisma generate

WORKDIR /app
COPY apps/web apps/web
ENV VITE_API_URL=""
RUN npm run build -w apps/web

WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
