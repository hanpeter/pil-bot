FROM node:fermium

WORKDIR /pil-bot

# Install app dependencies
# XXX: Copy only package.json & package-lock.json first to take
#      advantage of Docker build cache
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

ENTRYPOINT [ "node", "src/clock.js" ]
