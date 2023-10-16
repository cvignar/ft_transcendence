FROM node:18

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

COPY . /

WORKDIR /contracts

RUN mkdir -p /upload \
	&& npm install -g npm@10.0.0 \
	&& npm i

WORKDIR /backend

RUN npm i

EXPOSE 3000

CMD [ "/bin/sh", "-c", "npx prisma migrate deploy && npm run start" ]