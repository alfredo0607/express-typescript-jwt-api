# Frontend — Next.js + React

Interfaz web para la JWT Auth API. Implementa registro, login, dashboard de usuario y panel de administración con gestión de usuarios. El estado de autenticación se maneja con Zustand y los datos del servidor con TanStack Query.

---

## Stack

|                 |                                 |
| --------------- | ------------------------------- |
| Framework       | Next.js 16 (App Router)         |
| Lenguaje        | TypeScript 5                    |
| UI              | React 19, shadcn/ui, Radix UI   |
| Estilos         | Tailwind CSS v4                 |
| Estado auth     | Zustand v5                      |
| Server state    | TanStack Query v5               |
| HTTP client     | Axios                           |
| Formularios     | react-hook-form + Zod v3        |
| Notificaciones  | Sonner                          |
| Deploy          | Cloudflare Pages (via Wrangler) |
| Package manager | pnpm                            |

---

## Páginas

| Ruta           | Acceso      | Descripción                                     |
| -------------- | ----------- | ----------------------------------------------- |
| `/`            | público     | Redirect a `/login` o `/dashboard` según sesión |
| `/login`       | público     | Formulario de login con validación Zod          |
| `/register`    | público     | Formulario de registro                          |
| `/dashboard`   | autenticado | Vista principal del usuario                     |
| `/profile`     | autenticado | Perfil y datos del usuario                      |
| `/admin/users` | admin       | Tabla de usuarios con acciones CRUD             |

Las rutas protegidas usan el layout de `(dashboard)` que verifica el token en Zustand antes de renderizar. Si no hay sesión activa, redirige a `/login`.

---

## Estructura del proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/        page.tsx
│   │   │   └── register/     page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx    guard de autenticación
│   │   │   ├── dashboard/    page.tsx
│   │   │   ├── profile/      page.tsx
│   │   │   └── admin/
│   │   │       └── users/    page.tsx
│   │   ├── layout.tsx        root layout (providers)
│   │   └── page.tsx          redirect según sesión
│   ├── components/
│   │   ├── nav.tsx           barra de navegación
│   │   ├── providers.tsx     TanStack Query + Sonner + Theme
│   │   └── ui/               componentes shadcn/ui
│   ├── hooks/                custom hooks (useAuth, etc.)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts     instancia Axios con interceptor de token
│   │   │   ├── auth.ts       llamadas a /api/auth/*
│   │   │   └── users.ts      llamadas a /api/users/*
│   │   └── utils.ts          cn() y helpers
│   ├── stores/
│   │   └── auth.store.ts     Zustand — accessToken, user, roles
│   └── types/                tipos compartidos del dominio
├── public/
├── next.config.ts
├── wrangler.toml             configuración Cloudflare Pages
├── tsconfig.json
└── package.json
```

---

## Flujo de autenticación

### Login

1. El formulario envía email + password a `POST /api/auth/login`.
2. La respuesta incluye `accessToken` (JWT) y `refreshToken` (opaque).
3. El `accessToken` se guarda en Zustand (memoria); el `refreshToken` en una cookie HttpOnly o localStorage según la configuración del servidor.
4. Axios intercepta cada request saliente y adjunta `Authorization: Bearer <accessToken>`.

### Refresh automático

El interceptor de respuesta de Axios detecta respuestas `401`. Cuando ocurre:

1. Llama a `POST /api/auth/refresh` con el `refreshToken`.
2. Actualiza el `accessToken` en Zustand.
3. Reintenta el request original con el nuevo token.

### Logout

Llama a `POST /api/auth/logout`, que invalida el `refreshToken` en Redis, y limpia el store de Zustand.

---

## Estado (Zustand auth store)

```typescript
// src/stores/auth.store.ts
interface AuthStore {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}
```

El store vive solo en memoria — no persiste en `localStorage` por defecto para evitar XSS. El token se pierde al recargar la página, momento en que el interceptor intenta un refresh automático.

---

## Variables de entorno

Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

En producción apuntar a la URL del servidor Express.

---

## Setup local

### Prerrequisitos

- Node.js LTS
- pnpm
- El backend corriendo en `http://localhost:3000` (ver [backend README](../backend/README.md))

### Pasos

```bash
pnpm install
pnpm dev      # http://localhost:3001
```

---

## Scripts

| Comando       | Descripción                                    |
| ------------- | ---------------------------------------------- |
| `pnpm dev`    | Servidor de desarrollo en puerto 3001          |
| `pnpm build`  | Build estático para producción (`out/`)        |
| `pnpm start`  | Servidor Next.js de producción                 |
| `pnpm lint`   | ESLint                                         |
| `pnpm deploy` | Build + deploy a Cloudflare Pages via Wrangler |

---

## Deploy a Cloudflare Pages

```bash
# Autenticarse con Cloudflare (primera vez)
pnpm wrangler login

# Build + deploy
pnpm deploy
```

La configuración del proyecto en Cloudflare está en `wrangler.toml`. El output estático de Next.js (`out/`) se sube directamente como sitio estático.

> Asegurarse de configurar la variable `NEXT_PUBLIC_API_URL` en el panel de Cloudflare Pages apuntando al servidor Express de producción.
