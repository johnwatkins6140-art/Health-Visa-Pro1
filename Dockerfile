FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.26.1

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build args
ARG VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

# Build apps
RUN pnpm --filter @workspace/uk-health-visa run build
RUN pnpm --filter @workspace/api-server run build

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 🔥 CRITICAL DEBUG CMD (prevents container from dying instantly)
CMD ["sh", "-c", "echo 'Starting app...' && node artifacts/api-server/dist/index.cjs || (echo 'App crashed, keeping container alive...' && sleep 3600)"]
