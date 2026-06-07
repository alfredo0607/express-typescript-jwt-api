Problema

Construir una API REST production-ready con autenticación stateless (JWT), control de acceso basado en roles (RBAC), protección contra abuso (rate limiting), validación exhaustiva de inputs, y documentación automática. El deploy debe ser reproducible con Docker y la infraestructura gestionada con Terraform.

Solución

API construida con Express + TypeScript usando una arquitectura en capas (routes → middleware → controllers → services → repositories). JWT para autenticación stateless con refresh token rotation. RBAC con roles definidos en base de datos. Rate limiting por IP y por usuario con Redis. Validación con Zod en cada endpoint. Documentación OpenAPI generada automáticamente. Containerizada con Docker multi-stage y desplegada en EC2 + Docker.


 Cliente (React / React Native / Postman)
     │ HTTPS
     ▼
  ┌──────────────────────────────────────────────────────┐
  │  Express App (TypeScript)                            │
  │                                                      │
  │  Request Pipeline:                                   │
  │  ┌─────────────────────────────────────────────────┐ │
  │  │ 1. Helmet (security headers)                    │ │
  │  │ 2. CORS (allow-list de orígenes)               │ │
  │  │ 3. Rate Limiter (100 req/15min por IP, Redis)  │ │
  │  │ 4. Body Parser (JSON, max 1MB)                 │ │
  │  │ 5. Morgan (request logging)                    │ │
  │  │ 6. authenticate() middleware (JWT verify)      │ │
  │  │ 7. authorize() middleware (RBAC check)         │ │
  │  │ 8. validate() middleware (Zod schema)          │ │
  │  │ 9. Route Handler (Controller)                  │ │
  │  │ 10. Error Handler global                       │ │
  │  └─────────────────────────────────────────────────┘ │
  └────────────────────────┬────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌────────────────┐
  │ PostgreSQL  │   │    Redis    │   │  Secrets Mgr   │
  │ (usuarios,  │   │ (rate limit │   │ (JWT secret,   │
  │  roles,     │   │  + sessions)│   │  DB password)  │
  │  recursos)  │   └─────────────┘   └────────────────┘
  └─────────────┘

  Auth Flow (JWT + Refresh Token):
  POST /auth/login ──▶ valida credenciales ──▶ genera:
    • accessToken  (JWT, 15 min, firmado con RS256)
    • refreshToken (opaque, 7 días, almacenado en Redis)

  POST /auth/refresh ──▶ valida refreshToken en Redis ──▶ rota:
    • nuevo accessToken (15 min)
    • nuevo refreshToken (7 días) + invalida el anterior


Implementación
1
Arquitectura en capas (Layered Architecture)
La aplicación se divide en: Routes (define endpoints y aplica middleware), Controllers (maneja el request/response, delega lógica), Services (lógica de negocio pura, testeable), Repositories (acceso a datos, abstrae la DB). Esta separación permite testear cada capa de forma independiente con mocks.

2
Autenticación JWT con RS256 y Refresh Token Rotation
Se usa RS256 (asimétrico) en lugar de HS256: la clave privada firma los tokens (solo el servidor), la clave pública verifica (puede distribuirse a otros servicios). Access token: 15 minutos, contiene userId y roles. Refresh token: opaque UUID aleatorio, 7 días, almacenado en Redis con el userId asociado. Refresh token rotation: cada vez que se usa, se invalida y genera uno nuevo.

3
Control de acceso basado en roles (RBAC)
Los roles (admin, user, viewer) se almacenan en PostgreSQL y se incluyen en el JWT payload al login. El middleware authorize('admin', 'user') verifica que el rol del token esté en la lista permitida. Para permisos más granulares (ej: solo el dueño del recurso puede editar), se hace una verificación adicional en el Service layer comparando req.user.id con el ownerId del recurso.

4
Validación con Zod en cada endpoint
Cada endpoint define un schema Zod para body, params y query. El middleware validate(schema) ejecuta schema.parse() y retorna 400 con los errores de validación si falla. Zod garantiza type safety en runtime, complementando TypeScript que solo opera en compile time.

5
Rate Limiting con Redis
express-rate-limit con Redis store (rate-limit-redis). Límites: 100 requests/15min por IP (global), 5 intentos de login/15min por IP (anti-brute-force), 1000 requests/hora por usuario autenticado. Redis persiste los contadores entre restarts del servidor y entre múltiples instancias (crítico en ECS con múltiples tasks).

6
Documentación OpenAPI con Swagger UI
swagger-jsdoc genera la especificación OpenAPI 3.0 desde JSDoc comments en las routes. swagger-ui-express sirve el UI interactivo en /api/docs. Cada endpoint documenta: descripción, parámetros, request body schema, response schemas (200, 400, 401, 403, 404, 500), y ejemplos.


Tech Stack
Runtime & Framework

Node.js LTS
Express
TypeScript 
Autenticación & Seguridad

jsonwebtoken (RS256)
bcrypt
helmet
cors
express-rate-limit
Validación & Documentación

Zod
swagger-jsdoc
swagger-ui-express
Base de datos

PostgreSQL
node-postgres (pg)
pg-pool
Caché & Sessions

Redis 7
ioredis
rate-limit-redis
Infraestructura

Docker (multi-stage)
EC2 + Docker
Terraform
GitHub Actions