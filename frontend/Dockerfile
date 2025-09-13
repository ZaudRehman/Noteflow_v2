# Use official Node.js LTS alpine image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy only production node_modules and build output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
