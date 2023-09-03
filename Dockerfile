FROM debian:buster

RUN apt-get update \
	&& apt-get install curl unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18
COPY pong.zip .

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash \
	&& . $NVM_DIR/nvm.sh \
	&& nvm install $NODE_VERSION \
	&& nvm use $NODE_VERSION \
	&& nvm alias default $NODE_VERSION \
	&& echo "source $NVM_DIR/nvm.sh" >> /root/.bashrc \
	&& unzip pong.zip \
	&& rm -f pong.zip

WORKDIR /pong

RUN . $NVM_DIR/nvm.sh \
	&& npm install \
	&& npm install typescript tsc \
	&& npm i \
	&& npx tsc

EXPOSE 80

#ENTRYPOINT [ "/bin/bash" ]
#CMD [ "npm", "start" ]
