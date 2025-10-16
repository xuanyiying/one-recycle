# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --only=production

FROM base AS build
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS final
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
CMD ["node", "dist/main"]