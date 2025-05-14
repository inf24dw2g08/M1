FROM node:18-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN npm install

# Configurações JWT
ENV JWT_SECRET=your_jwt_secret_key
ENV JWT_EXPIRATION=1h
ENV REFRESH_TOKEN_EXPIRATION=7d

COPY ./src ./src
COPY ./public ./public
COPY ./index.js ./

CMD ["node", "index.js"]