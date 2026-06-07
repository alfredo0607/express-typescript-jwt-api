# ── Stage 1: build TypeScript ────────────────────────────────────────────────
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY package.json ./
RUN pnpm install --no-frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm build

# ── Stage 2: imagen final con solo deps de producción ────────────────────────
FROM node:24-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && groupadd -r app && useradd -r -g app app

WORKDIR /app

COPY package.json ./
RUN pnpm install --no-frozen-lockfile --prod

# Elimina herramientas de build (ya no se necesitan en runtime)
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
