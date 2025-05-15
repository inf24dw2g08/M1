FROM node:18-alpine3.18

WORKDIR /app

COPY package*.json ./

# Adicionar pacotes necessários
RUN npm install && \
    npm install passport passport-google-oauth20 node-fetch@2 --save

COPY ./src ./src
COPY ./public ./public
COPY ./index.js ./

EXPOSE 3000

CMD ["node", "index.js"]