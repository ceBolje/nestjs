FROM node:12.16-alpine as nodejs_nestjs
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package*.json ./
COPY . ./


# install packages (with devDependencies) 
RUN yarn --production=false
# build app

RUN yarn build
# run bundle
CMD ["sh", "-c", "yarn start"]
EXPOSE  ${APP_PORT}

