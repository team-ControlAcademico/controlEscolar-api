FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./
RUN pnpm install

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["pnpm", "dev"]

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
EXPOSE 4000
CMD ["pnpm", "start"]
