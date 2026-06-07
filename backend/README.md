# Backend — Express + TypeScript JWT API

API REST production-ready con autenticación JWT RS256, control de acceso basado en roles (RBAC), rate limiting distribuido con Redis, validación con Zod y documentación OpenAPI automática.

---

## Stack

|                  |                                       |
| ---------------- | ------------------------------------- |
| Runtime          | Node.js LTS                           |
| Framework        | Express 5                             |
| Lenguaje         | TypeScript 6                          |
| Auth             | jsonwebtoken (RS256), bcrypt          |
| Base de datos    | PostgreSQL 17 (pg + pool)             |
| Caché / sesiones | Redis 7 (ioredis)                     |
| Rate limiting    | express-rate-limit + rate-limit-redis |
| Validación       | Zod v4                                |
| Documentación    | swagger-jsdoc + swagger-ui-express    |
| Dev runner       | tsx watch                             |
| Package manager  | pnpm                                  |

---

## Arquitectura en capas

```
Routes → Middleware → Controllers → Services → Repositories
```

| Capa             | Responsabilidad                                              |
| ---------------- | ------------------------------------------------------------ |
| **Routes**       | Define endpoints, aplica middleware en orden                 |
| **Middleware**   | authenticate, authorize, validate, rateLimiter, errorHandler |
| **Controllers**  | Parsea request/response, delega a services                   |
| **Services**     | Lógica de negocio pura, testeable en aislamiento             |
| **Repositories** | Acceso a datos, abstrae el pool de PostgreSQL                |

---

## Pipeline de request

Cada request pasa por esta cadena antes de llegar al controller:

```
1. Helmet          — security headers (X-Frame-Options, CSP, etc.)
2. CORS            — allow-list de orígenes configurado en env
3. Rate Limiter    — 100 req / 15 min por IP (contadores en Redis)
4. Body Parser     — JSON + urlencoded, límite 1 MB
5. Morgan          — request logging
6. authenticate()  — verifica JWT RS256 (rutas protegidas)
7. authorize()     — verifica rol contra la lista permitida
8. validate()      — Zod schema parse de body/params/query
9. Controller      — lógica de negocio vía service
10. errorHandler   — captura AppError y errores no esperados → JSON
```

---

## Autenticación JWT RS256

Se usa RS256 (asimétrico) en lugar de HS256:

- La **clave privada** firma los tokens — solo el servidor la conoce.
- La **clave pública** verifica — puede distribuirse a microservicios sin exponer la privada.

**Access token:** JWT firmado, 15 min de vida, payload `{ sub, roles }`.  
**Refresh token:** UUID v4 opaque, 7 días, almacenado en Redis con el `userId` asociado.

### Refresh token rotation

Cada uso del refresh token invalida el anterior y emite un par nuevo. Si un token robado llega después de que el usuario legítimo lo rotó, Redis lo rechaza.

```
POST /api/auth/refresh
  → busca refreshToken en Redis
  → si existe: DEL token viejo, genera accessToken + refreshToken nuevos
  → si no existe: 401 Unauthorized
```

---

## RBAC (Control de acceso por roles)

Los roles (`admin`, `user`, `viewer`) se almacenan en PostgreSQL y se incluyen en el JWT payload al hacer login.

```typescript
// Ruta que solo permite admin o user
router.get("/profile", authenticate, authorize("admin", "user"), getProfile);
```

El middleware `authorize()` verifica que `req.user.roles` contenga al menos uno de los roles permitidos. Para permisos de recurso (solo el dueño puede editar), la verificación se hace en la capa Service comparando `req.user.id` con el `ownerId` del recurso.

---

## Rate limiting

| Límite                    | Alcance                     | Store |
| ------------------------- | --------------------------- | ----- |
| 100 req / 15 min          | por IP — global             | Redis |
| 5 intentos login / 15 min | por IP — ruta `/auth/login` | Redis |
| 1000 req / hora           | por usuario autenticado     | Redis |

Redis persiste los contadores entre reinicios y entre múltiples instancias del servidor.

---

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          variables de entorno validadas con Zod
│   │   ├── database.ts     pool de conexiones PostgreSQL
│   │   ├── redis.ts        cliente ioredis
│   │   └── jwt.ts          carga lazy de claves PEM
│   ├── docs/
│   │   └── swagger.ts      configuración OpenAPI 3.0
│   ├── middleware/
│   │   ├── authenticate.ts verifica JWT RS256
│   │   ├── authorize.ts    RBAC — verifica roles
│   │   ├── validate.ts     Zod schema parse
│   │   ├── rateLimiter.ts  global + login rate limiters
│   │   └── errorHandler.ts maneja AppError y errores genéricos
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── users.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── users.service.ts
│   ├── repositories/
│   │   └── user.repository.ts
│   ├── models/
│   │   ├── auth.schemas.ts  Zod schemas de auth (login, register, refresh)
│   │   ├── users.schemas.ts Zod schemas de users
│   │   └── user.model.ts    tipo User de PostgreSQL
│   ├── types/
│   │   └── index.ts         UserRole, JwtPayload, AuthUser, Express.Request augment
│   ├── utils/
│   │   └── AppError.ts      factory de errores HTTP tipados
│   ├── app.ts               Express app — middleware pipeline
│   └── server.ts            arranque del servidor
├── database/
│   └── schema.sql           tablas users, roles, user_roles + trigger updated_at
├── keys/                    claves RSA (no commitear)
│   ├── private.pem
│   └── public.pem
├── .env.example
├── Dockerfile
├── docker-compose.yml       PostgreSQL + Redis + API
├── docker-compose.dev.yml   solo PostgreSQL + Redis (para pnpm dev local)
├── tsconfig.json
└── package.json
```

---

## Endpoints

| Método   | Ruta                 | Auth        | Descripción                        |
| -------- | -------------------- | ----------- | ---------------------------------- |
| `POST`   | `/api/auth/register` | —           | Registro de usuario                |
| `POST`   | `/api/auth/login`    | —           | Login → accessToken + refreshToken |
| `POST`   | `/api/auth/refresh`  | —           | Rota refresh token                 |
| `POST`   | `/api/auth/logout`   | JWT         | Invalida refresh token en Redis    |
| `GET`    | `/api/users/me`      | JWT         | Perfil del usuario autenticado     |
| `GET`    | `/api/users`         | JWT + admin | Lista todos los usuarios           |
| `PATCH`  | `/api/users/:id`     | JWT + admin | Actualiza usuario                  |
| `DELETE` | `/api/users/:id`     | JWT + admin | Elimina usuario                    |
| `GET`    | `/api/docs`          | —           | Swagger UI                         |
| `GET`    | `/health`            | —           | Health check                       |

---

## Variables de entorno

Copiar `.env.example` → `.env` y ajustar los valores:

```env
# Server
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jwt_api_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT RS256
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=604800   # 7 días en segundos

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # 15 min
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# CORS (orígenes permitidos, separados por coma)
CORS_ORIGIN=http://localhost:3001

# Logs
LOG_LEVEL=dev
```

---

## Setup local

### Prerrequisitos

- Node.js LTS
- pnpm
- Docker + Docker Compose
- OpenSSL (para generar las claves RSA)

### Pasos

```bash
# 1. Generar claves RSA (ejecutar una sola vez)
mkdir keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 2. Variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Levantar PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# 4. Instalar dependencias
pnpm install

# 5. Correr en modo desarrollo
pnpm dev
# API:        http://localhost:3000
# Swagger UI: http://localhost:3000/api/docs
# Health:     http://localhost:3000/health
```

### Producción con Docker

```bash
docker compose up -d
# Levanta PostgreSQL + Redis + API en contenedores
# El schema SQL se aplica automáticamente al primer arranque
```

---

## Scripts

| Comando      | Descripción                          |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Servidor con tsx watch (hot reload)  |
| `pnpm build` | Compilar TypeScript → `dist/`        |
| `pnpm start` | Correr build compilado               |
| `pnpm lint`  | Type-check sin emitir (tsc --noEmit) |

---

## Base de datos

El schema en `database/schema.sql` crea:

- `users` — id, email, password_hash, name, created_at, updated_at
- `roles` — id, name (admin, user, viewer)
- `user_roles` — relación N:M entre users y roles
- Trigger `updated_at` — se actualiza automáticamente en cada UPDATE
