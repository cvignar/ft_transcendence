FROM debian:buster

RUN apt-get update \
	&& apt-get install curl unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18.17.1
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
	&& npm uninstall tsc \
	&& npm install -D typescript \
	&& npm i \
	&& npx tsc

EXPOSE 10080

ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

ENTRYPOINT ["/bin/bash", "-c", "npm start"]
#CMD [ "npm", "start" ]
