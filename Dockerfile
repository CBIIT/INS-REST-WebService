FROM node:22-alpine3.23 AS fnl_base_image

ENV PORT=8081
ENV NODE_ENV=production

WORKDIR /usr/src/app

# zlib: CVE-2026-27171, openssl: CVE-2026-2673, CVE-2026-31790
RUN apk update && apk add --no-cache --upgrade zlib=1.3.2-r0 openssl

COPY package*.json ./
COPY --chown=node:node . .

RUN npm ci --only=production

RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm \
  && rm -f /usr/local/bin/npx

EXPOSE 8081 9200

CMD [ "node", "app.js" ]
