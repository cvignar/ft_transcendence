FROM debian:buster
RUN apt-get update
RUN apt-get install nvm npm
RUN nvm install 18 && nvm use 18

COPY ../pong/ /

WORKDIR /pong

RUN npm i && tsc

ENTRYPOINT [ "npm start" ]