FROM node:18.16-alpine3.17 as base

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

EXPOSE 3000

ENV PORT=3000

COPY . .


FROM base as development

ENV NODE_ENV=development

RUN yarn install

RUN apk add --no-cache make gcc g++ python3 && \
  yarn install && \
  yarn add --force bcrypt --build-from-source && \
  apk del make gcc g++ python3

CMD [ "yarn", "run", "dev-docker" ]


FROM base as production

ENV NODE_ENV=production

RUN yarn install --production

CMD [ "yarn", "run", "start" ]

