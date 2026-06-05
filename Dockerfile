FROM electronuserland/builder:wine AS build

WORKDIR /app
COPY app/ .
WORKDIR /ui
COPY ui/ .

WORKDIR /app
RUN npm i && npm run build:winui
