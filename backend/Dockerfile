FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

COPY backend.zip .
COPY contracts.zip .

RUN unzip -q backend.zip \
	&& unzip -q contracts.zip \
	&& rm -f backend.zip \
	&& rm -f contracts.zip

WORKDIR /contracts

RUN npm install \
	&& npm install -g npm@10.0.0 \
	&& npm i

WORKDIR /backend

RUN npm i

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]