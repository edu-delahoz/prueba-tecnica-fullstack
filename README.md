# Prueba Técnica Fullstack — Finance Manager (Next.js + Better Auth + Prisma + Supabase)

Aplicación fullstack para gestión de **ingresos y egresos**, **gestión de usuarios** y **reportes**, con **RBAC por roles**, **autenticación con GitHub**, **Swagger/OpenAPI** y despliegue en **Vercel**.

> Frontend y Backend usan **Next.js Pages Router** y **API Routes**.

---

## ✅ Funcionalidades

### Roles y permisos (RBAC)
- **USER**
  - Acceso a la sección de **Movements** (lista).
- **ADMIN**
  - Acceso a **Movements** (lista + creación).
  - Acceso a **Users** (listar + editar).
  - Acceso a **Reports** (saldo + gráfico + export CSV).

> Nota importante del enunciado: **los usuarios nuevos se asignan automáticamente como `ADMIN`** (para facilitar pruebas).

---

## 🧩 Secciones UI
- **Home**: menú principal con accesos a:
  - Movements (todos los roles)
  - Users (solo ADMIN)
  - Reports (solo ADMIN)
- **Movements**:
  - Tabla: Concept, Amount, Date, User
  - Admin: crear movimiento (INCOME/EXPENSE)
  - Paginación
- **Users** (ADMIN):
  - Tabla: Name, Email, Phone, Actions (edit)
  - Modal de edición (name, role; phone solo si el proyecto lo incluye)
  - Paginación
- **Reports** (ADMIN):
  - Saldo (Income − Expense)
  - Gráfico (Recharts)
  - Descargar CSV
  - (Opcional) Vista online del CSV

---

## 🛠️ Stack Tecnológico

### Frontend
- Next.js (Pages Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes UI basados en Radix + Tailwind)

### Backend
- Next.js API Routes (REST)
- Prisma ORM
- PostgreSQL en Supabase
- Better Auth (GitHub OAuth + sesiones en DB mediante Prisma)

### Docs
- Swagger UI: `GET /api/docs`
- OpenAPI JSON: `GET /api/openapi.json`

### Tests
- Vitest (unit tests)
- >= 3 tests (se incluyen más para robustez)

---

## 📦 Requisitos Previos
- Node.js **>= 18**
- npm (o el package manager configurado en el repo)
- Cuenta Supabase (Postgres)
- App OAuth en GitHub (Client ID / Secret)

---

## 🚀 Setup Local

### 1) Instalar dependencias
```bash
npm install
