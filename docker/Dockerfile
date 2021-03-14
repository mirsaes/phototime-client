FROM mirsaes/phototime-server
# docker build -t mirsaes/phototime -f docker/Dockerfile .

LABEL maintainer="mirsaes"
#ENV NODE_ENV=production

COPY . /phototime-client
COPY docker/docker-app-config.json /usr/src/phototime-server/appConfig.json