FROM node:22-alpine3.23 AS fnl_base_image

ENV PORT 8081
ENV NODE_ENV production

WORKDIR /usr/src/app

RUN npm install -g npm@latest

COPY package*.json ./

RUN npm ci --only=production

#USER node

COPY --chown=node:node . .

EXPOSE 8081 9200

CMD [ "node", "app.js" ]
