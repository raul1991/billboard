FROM node:8

#Install packages
RUN npm install -g @angular/cli

#Set the working directory to /app
WORKDIR /app

#Copy the current directory contents into the container at /app
COPY . /app

#Install dependencies
RUN npm install

ENV NG_PORT 9000 
ENV NG_HOST 0.0.0.0
ENV VAULT_DEV_ROOT_TOKEN_ID devtoken
ENV VAULT_DEV_LISTEN_ADDRESS 0.0.0.0:9001

#Expose a port
EXPOSE 9000 9001

#Run the init script
CMD ./docker-init.sh
