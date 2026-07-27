FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# statuslist-agent listens on PORT (default 9156)
CMD ["yarn", "watch"]
