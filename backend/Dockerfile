# Stage 1: Build dependencies
FROM node:18 AS build

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Stage 2: Create production image
FROM node:18-slim

WORKDIR /usr/src/app

# Copy only needed files from build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose the port your app runs on
EXPOSE 5000

# Use node to run the app
CMD ["node", "server.js"]
