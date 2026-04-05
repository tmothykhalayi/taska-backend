# Using Node.js 22 Alpine as base image
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Create applogs directory for logging
RUN mkdir -p /app/applogs

# Copy package files (exclude pnpm-workspace.yaml if not used)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Expose application port
EXPOSE 9000

# Start application
CMD ["pnpm", "run", "start:dev"]
