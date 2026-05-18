FROM node:20-alpine AS base

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM base AS development

ENV NODE_ENV=development

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production

RUN apk add --no-cache postgresql-client

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install sequelize-cli --no-save

COPY . .
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["node", "server.js"]
