# JWT Auth Full-Stack

Boilerplate de autenticación production-ready: API REST con Express + TypeScript en el backend, interfaz web con Next.js en el frontend. Implementa JWT RS256 con refresh token rotation, control de acceso basado en roles (RBAC) y rate limiting distribuido con Redis.

---

## El problema que resuelve

Construir autenticación segura desde cero repetidamente es costoso y propenso a errores. Este proyecto centraliza las decisiones de seguridad correctas: tokens asimétricos (RS256), rotación de sesiones, protección contra fuerza bruta, validación exhaustiva de inputs y RBAC; todo en un stack moderno, tipado y listo para producción.

---

## Arquitectura general

```
Browser (Next.js 16)
      │  HTTPS
      ▼
Express API (TypeScript)
  ├── Helmet + CORS
  ├── Rate Limiting (Redis)
  ├── JWT RS256 (authenticate)
  ├── RBAC (authorize)
  └── Zod (validate)
      │
      ├── PostgreSQL  — usuarios, roles, recursos
      └── Redis       — rate limit counters + refresh tokens
```

**Auth flow:**

```
POST /api/auth/login
  → valida credenciales en PostgreSQL
  → emite accessToken  (JWT RS256, 15 min)
  → emite refreshToken (UUID opaque, 7 días, guardado en Redis)

POST /api/auth/refresh
  → verifica refreshToken en Redis
  → rota: invalida el anterior, emite par nuevo
```

---

## Estructura del repositorio

```
.
├── backend/       API REST — Express 5 + TypeScript + PostgreSQL + Redis
└── frontend/      Web app — Next.js 16 + React 19 + shadcn/ui
```

Cada carpeta tiene su propio `package.json`, `README.md` y configuración independiente.

---

## Quick start

### 1. Backend

```bash
cd backend

# Generar claves RSA para JWT RS256
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# Variables de entorno
cp .env.example .env   # editar DB_PASSWORD, etc.

# Levantar PostgreSQL + Redis con Docker
docker compose up postgres redis -d

# Instalar dependencias y correr en modo desarrollo
pnpm install
pnpm dev              # http://localhost:3000
                      # Swagger UI: http://localhost:3000/api/docs
```

### 2. Frontend

```bash
cd frontend

pnpm install
pnpm dev              # http://localhost:3001
```

---

## Stack

| Capa | Tecnología |
|---|---|
| API | Express 5, TypeScript 6, Node.js LTS |
| Auth | jsonwebtoken RS256, bcrypt, UUID refresh tokens |
| Validación | Zod v4 (backend), Zod v3 + react-hook-form (frontend) |
| Base de datos | PostgreSQL 17, pg + pool |
| Caché / sesiones | Redis 7, ioredis, rate-limit-redis |
| Docs | OpenAPI 3.0, swagger-jsdoc, swagger-ui-express |
| UI | Next.js 16, React 19, shadcn/ui, Tailwind CSS v4 |
| Estado | Zustand v5 (auth store), TanStack Query v5 (server state) |
| Infraestructura | Docker multi-stage, docker-compose, Cloudflare Pages |

---

## Documentación detallada

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

## Autor

**Ing. Alfredo Dominguez** — [alfredojosedominguezhernandez@gmail.com](mailto:alfredojosedominguezhernandez@gmail.com)  
