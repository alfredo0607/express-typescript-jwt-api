# ── Stage 1: build TypeScript ────────────────────────────────────────────────
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json npm-lock.yaml* ./
RUN npm install --frozen-lockfile

COPY tsconfig.json ./
COPY keys/ ./keys/
COPY src/ ./src/
RUN npm run build

# Elimina devDependencies del store
RUN npm prune --prod

# ── Stage 2: imagen final con solo deps de producción ────────────────────────
FROM node:24-slim AS production

RUN groupadd -r app && useradd -r -g app app

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/keys ./keys

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
