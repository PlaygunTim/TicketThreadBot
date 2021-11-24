FROM node:17 as base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./dist

RUN npx prisma generate
RUN npm run build
