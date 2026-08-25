FROM node:20-alpine AS build

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/config ./config
COPY --from=build /opt/app/src ./src

ENV NODE_ENV=production
EXPOSE 1337

CMD ["npm", "run", "start"]
