FROM node:23-alpine AS builder

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .
RUN yarn dbs:gen
RUN yarn build

FROM node:23-alpine AS production
ENV NODE_ENV=production

RUN apk add --no-cache wget

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./


RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]