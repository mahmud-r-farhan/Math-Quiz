FROM node:18
WORKDIR /usr/src/app

# Install nodemon globally for development
RUN npm install -g nodemon


COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000

CMD ["nodemon", "server.js"]
