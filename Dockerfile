FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.26.1

# Copy EVERYTHING (not just artifacts)
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build projects
RUN pnpm --filter @workspace/uk-health-visa run build
RUN pnpm --filter @workspace/api-server run build

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run correct built file (adjust if needed)
CMD ["sh", "-c", "ls -R && node packages/api-server/dist/index.js"]
