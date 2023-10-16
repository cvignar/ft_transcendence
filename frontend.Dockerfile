FROM node:18

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

COPY . /

WORKDIR /frontend

RUN npm install -g npm@10.0.0 \
	&& npm i

EXPOSE 5173

CMD [ "npm", "run", "dev"]