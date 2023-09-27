FROM node:18

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

RUN mkdir /backend \
    && mkdir /contracts \
    && mkdir /upload \
    && mkdir /frontend \
    && mkdir /pong \
    && mkdir /upload

WORKDIR /contracts

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm i

WORKDIR /backend

RUN npm i

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]