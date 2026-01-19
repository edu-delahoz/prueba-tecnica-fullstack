
# Prueba Técnica Fullstack — Finance Manager
**Next.js (Pages Router) + Better Auth (GitHub) + Prisma + Supabase + RBAC + Swagger + Vercel**

Aplicación fullstack para gestión de **ingresos y egresos**, **gestión de usuarios** y **reportes**.  
Frontend y backend están implementados con **Next.js Pages Router** y **API Routes**, con **autenticación por GitHub** usando **Better Auth** y sesiones persistidas en **Postgres (Supabase)** mediante **Prisma**.

---

## ✅ Funcionalidades principales

### Roles y permisos (RBAC)
- **USER**
  - Acceso a **Movements** (listar movimientos).
- **ADMIN**
  - Acceso a **Movements** (listar + crear).
  - Acceso a **Users** (listar + editar).
  - Acceso a **Reports** (saldo + gráfico + export CSV).

> **Nota del enunciado**: todos los nuevos usuarios se asignan automáticamente con rol **ADMIN** para facilitar pruebas.  
> Esto se implementa en Prisma: `User.role` tiene `@default(ADMIN)`.

---

## 🧭 Home (menú principal)
La página de inicio muestra navegación a 3 secciones:
- **Movements** (disponible para todos los roles)
- **Users** (solo ADMIN)
- **Reports** (solo ADMIN)

Cuando el usuario no tiene sesión o no tiene permisos:
- La UI bloquea secciones con candado (UX).
- **La API siempre valida RBAC** (seguridad real).
- Las páginas `/users` y `/reports` redirigen a Home si no hay sesión / no hay rol ADMIN.

---

## 💸 Movements (Ingresos/Egresos)
- Tabla con columnas:
  - **Concept**
  - **Amount**
  - **Date**
  - **User**
- Botón **New** para agregar movimiento (**solo ADMIN**).
- **Paginación server-side** con `page` y `limit`.
- **Búsqueda server-side** con `search`.
- Loading profesional: tabla estable + skeleton (sin “flicker”).

---

## 👥 Users (solo ADMIN)
- Tabla con columnas:
  - **Name**
  - **Email**
  - **Phone**
  - **Role**
  - **Actions** (editar)
- Formulario/modal de edición:
  - **Name**
  - **Role**
- **Paginación server-side** + `search`.

---

## 📊 Reports (solo ADMIN)
- Resumen financiero:
  - **Income**
  - **Expense**
  - **Net/Balance**
- Gráfico (Recharts).
- Descargar CSV.

---

## 🧱 Stack Tecnológico

### Frontend
- Next.js **Pages Router**
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI + Tailwind)

### Backend
- Next.js API Routes (REST)
- Prisma ORM
- PostgreSQL en Supabase
- Better Auth (GitHub OAuth + sesiones en BD con Prisma)

### Documentación API
- Swagger UI: `GET /api/docs`
- OpenAPI JSON: `GET /api/openapi.json`
- Puedes entrar desde el enlace en el footer

### Tests
- Vitest (unit + integration)

---

## 📦 Requisitos previos
- Node.js **>= 18** (recomendado 20+)
- npm
- Cuenta Supabase (Postgres)
- GitHub OAuth App (Client ID / Secret)

---

## 🔐 Variables de entorno

Copia `.env.example` a `.env` y completa los valores.

```bash
cp .env.example .env

### Variables requeridas

* `BETTER_AUTH_URL`

  * Local: `http://localhost:3000`
  * Producción: tu dominio de Vercel (ej: `https://<app>.vercel.app`)
* `BETTER_AUTH_SECRET`

  * Un string fuerte (mínimo 32 chars).
* `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

  * Desde GitHub Developer Settings (OAuth App).
* `DATABASE_URL`

  * Conexión **Pooler / PgBouncer** de Supabase (6543).
* `DIRECT_URL`

  * Conexión **Direct** (5432) usada para migraciones Prisma.

> **Importante (client)**: este proyecto usa `NEXT_PUBLIC_BETTER_AUTH_URL` en el cliente Better Auth.
> Agrega esta variable en `.env` (y en Vercel):

* `NEXT_PUBLIC_BETTER_AUTH_URL` = el mismo valor que `BETTER_AUTH_URL`

Ejemplo (local):

```env
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="super-secret-strong-value"

GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://...:5432/postgres?sslmode=require"
```

---

## 🐙 Configurar GitHub OAuth App

En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**

* **Homepage URL**

  * Local: `http://localhost:3000`
  * Prod: `https://<tu-app>.vercel.app`
* **Authorization callback URL**

  * Local: `http://localhost:3000/api/auth/callback/github`
  * Prod: `https://<tu-app>.vercel.app/api/auth/callback/github`

> Nota: Better Auth expone sus rutas bajo `/api/auth/*` (ver `pages/api/auth/[...all].ts`).

---

## 🗄️ Base de datos (Supabase + Prisma)

1. Crea un proyecto en Supabase.

2. Obtén las cadenas de conexión:

   * **Pooler** para runtime (`DATABASE_URL`, puerto 6543).
   * **Direct** para migraciones (`DIRECT_URL`, puerto 5432).

3. Ejecuta migraciones y genera Prisma Client:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

Opcional: Prisma Studio

```bash
npm run prisma:studio
```

---

## ▶️ Ejecutar en local

```bash
npm install
npm run dev
```

Abre:

* App: `http://localhost:3000`
* Swagger: `http://localhost:3000/api/docs`

---

## 🧪 Tests

```bash
npm test
```

Otros comandos:

```bash
npm run test:run
npm run test:watch
npm run lint
npm run build
```

---

## 🧾 Endpoints principales (resumen)

### Auth / Session

* `GET /api/me` → usuario actual (requiere sesión)

### Movements

* `GET /api/movements?page=1&limit=20&search=...` → lista paginada (requiere sesión)
* `POST /api/movements` → crear movimiento (solo ADMIN)

### Users (solo ADMIN)

* `GET /api/users?page=1&limit=20&search=...`
* `PATCH /api/users/:id` → editar nombre/rol

### Reports (solo ADMIN)

* `GET /api/reports/summary`
* `GET /api/reports/csv` → descarga CSV

> Documentación completa y ejemplos en: `/api/docs`

---

## 🚀 Deploy en Vercel

1. Importa el repo en Vercel.

2. Configura las **Environment Variables** (las mismas del `.env`):

   * `BETTER_AUTH_URL` (tu URL de Vercel)
   * `NEXT_PUBLIC_BETTER_AUTH_URL` (misma URL)
   * `BETTER_AUTH_SECRET`
   * `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   * `DATABASE_URL`, `DIRECT_URL`

3. Prisma migrate en deploy:

* El proyecto incluye el script:

  * `vercel-build`: `prisma migrate deploy && next build`

Vercel detecta automáticamente el script `vercel-build` si está definido.

---

## 🧑‍⚖️ Notas para evaluación / prueba rápida

* Usuarios nuevos quedan como **ADMIN** por defecto (para pruebas).
* Para simular usuario **USER**, entra como ADMIN → Users → edita un usuario y cambia el rol.
* `/users` y `/reports` redirigen a Home si no hay sesión o no hay permisos.
* La API siempre responde con 401/403 en endpoints protegidos.
