FROM node:18

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

RUN mkdir /pong

WORKDIR /pong

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm i

EXPOSE 12080

CMD [ "npm", "start" ]