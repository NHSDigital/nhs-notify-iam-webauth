### Base
FROM node:20-alpine AS base

# Install necessary packages for Puppeteer
# Installs latest Chromium (100) package.
RUN apk add --no-cache \
    chromium \
    ttf-freefont \
    udev

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy base dependencies describing

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
