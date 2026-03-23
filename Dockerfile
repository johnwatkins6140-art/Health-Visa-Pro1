FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm@10.26.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/

RUN pnpm install --frozen-lockfile

ARG VITE_PAYSTACK_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

RUN pnpm --filter @workspace/uk-health-visa run build

RUN pnpm --filter @workspace/api-server run build

RUN mkdir -p packages/api-server/dist && \
    cp artifacts/api-server/dist/index.cjs packages/api-server/dist/index.js

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "artifacts/api-server/dist/index.cjs"]
