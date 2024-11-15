FROM node:20-alpine AS builder

# Install necessary packages for Puppeteer
# Installs latest Chromium (100) package.
RUN apk add --no-cache \
    chromium \
    ttf-freefont \
    udev

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

# Switch to the non-root user
USER nonroot

RUN npm install --ignore-scripts

EXPOSE 3000

CMD ["npm", "run", "dev"]
