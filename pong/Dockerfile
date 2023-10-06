FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

# COPY pong.zip .

# RUN unzip -q pong.zip \
# 	&& rm -f pong.zip

# WORKDIR /pong

# RUN npm install \
# 	&& npm install -g npm@10.0.0 \
# 	&& npm i

# EXPOSE 12080

# CMD [ "npm", "start" ]

# ==================================

EXPOSE 12080

COPY start.sh .

RUN chmod +x /start.sh

WORKDIR /pong

ENTRYPOINT [ "/start.sh" ]
