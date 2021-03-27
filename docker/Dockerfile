
FROM mirsaes/phototime-server
# docker build -t mirsaes/phototime -f docker/Dockerfile .

LABEL maintainer="mirsaes"
ENV NODE_ENV=production

WORKDIR /phototime-client
COPY . .

RUN npm install cropperjs
RUN npm install panzoom

RUN mv node_modules/cropperjs/dist ./cropperjs-dist && \
    mv node_modules/cropperjs/LICENSE ./cropperjs-license && \
    mv node_modules/panzoom/dist ./panzoom-dist && \
    mv node_modules/panzoom/LICENSE ./panzoom-license && \
    rm -r ./node_modules && \
    mkdir -p node_modules/cropperjs && \
    mv cropperjs-dist node_modules/cropperjs/dist && \
    mv cropperjs-license node_modules/cropperjs/LICENSE && \
    mkdir -p node_modules/panzoom && \
    mv ./panzoom-dist node_modules/panzoom/dist && \
    mv ./panzoom-license node_modules/panzoom/LICENSE

COPY docker/docker-app-config.json /phototime-server/appConfig.json

WORKDIR /phototime-server/
