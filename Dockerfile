FROM node:erbium

WORKDIR /pil-bot

# Install app dependencies
# XXX: Copy only package.json & package-lock.json first to take
#      advantage of Docker build cache
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "node", "src/clock.js" ]
