FROM node:24-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate
RUN pnpm install --frozen-lockfile --prod

COPY src ./src

EXPOSE 3000

CMD ["sh", "-c", "pnpm migrate && pnpm start"]
