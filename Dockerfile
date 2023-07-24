FROM node:18.16-alpine3.17 as base

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

EXPOSE 3000

ENV PORT=3000

COPY . .


FROM base as development

ENV NODE_ENV=development

RUN yarn install

RUN yarn build

CMD [ "yarn", "run", "start:dev-ts" ]


FROM base as production

ENV NODE_ENV=production

RUN yarn install --production

CMD [ "yarn", "prod:start" ]

