FROM node:20-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY api ./api
COPY lib ./lib
COPY server-dev.js ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server-dev.js"]

