FROM node:22-alpine3.23 AS fnl_base_image

ENV PORT=8081
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Refresh base packages and require the zlib fix for CVE-2026-85091.
# BusyBox CVE-2025-60876 has no fixed Alpine 3.23 package yet.
RUN apk upgrade --no-cache && apk add --no-cache --upgrade \
  'zlib>=1.3.2-r1' \
  openssl

COPY package*.json ./
COPY --chown=node:node . .

RUN npm ci --omit=dev

RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm \
  && rm -f /usr/local/bin/npx

EXPOSE 8081 9200

CMD [ "node", "app.js" ]
