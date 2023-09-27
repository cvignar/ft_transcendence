FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18
COPY backend.zip .

RUN unzip backend.zip \
	&& rm -f backend.zip \
	&& mkdir /backend/upload

WORKDIR /backend

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm i \
	&& cd /contracts \
	&& npm i \
	&& cd /backend

EXPOSE 12080

CMD [ "npm", "run", "start:dev" ]