FROM node:18-alpine AS builder

WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app (creates the .next folder)
RUN npm run build

# Stage 2: Runner (Production)
FROM node:18-alpine AS runner

# working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built output and public assets from the builder stage
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public

# Expose the default port
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "start"]
