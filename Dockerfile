FROM node:20.15.1-slim

ENV PORT 8081
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

#USER node

COPY --chown=node:node . .

EXPOSE 8081 9200

CMD [ "node", "app.js" ]
