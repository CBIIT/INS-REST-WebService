FROM node:22-alpine3.23 AS fnl_base_image

ENV PORT=8081
ENV NODE_ENV=production

WORKDIR /usr/src/app

# zlib: CVE-2026-27171
RUN apk update && apk add --no-cache --upgrade zlib=1.3.2-r0

COPY package*.json ./
COPY --chown=node:node . .

RUN npm ci --only=production

RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm \
  && rm -f /usr/local/bin/npx

EXPOSE 8081 9200

CMD [ "node", "app.js" ]
