FROM node:18

RUN apt-get install unzip -y

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 18

# COPY frontend.zip .

# RUN unzip -q frontend.zip \
# 	&& rm -f frontend.zip

# WORKDIR /frontend

# RUN npm install \
# 	&& npm install -g npm@10.0.0 \
# 	&& npm i

# EXPOSE 5173

# CMD [ "npm", "run", "dev"]

# ==================================

EXPOSE 5173

COPY start.sh .

RUN chmod +x /start.sh

WORKDIR /frontend

ENTRYPOINT [ "/start.sh" ]
