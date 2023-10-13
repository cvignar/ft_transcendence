FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

COPY . /

WORKDIR /pong

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm install -g typescript \
	&& npm i \
	&& tsc

EXPOSE 12080

CMD [ "npm", "start" ]