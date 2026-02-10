# 🏪 Showroom App - Sistema de Gestión de Productos

<div align="center">

**Aplicación profesional de gestión de productos y generación de códigos QR**

Construida con Next.js 16, Prisma, y arquitectura modular por features

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Deployment](#-deployment)
- [Guía de Usuario](#-guía-de-usuario)

---

## ✨ Características

### Gestión de Productos
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- ✅ **Búsqueda Avanzada**: Búsqueda en tiempo real por SKU, nombre o marca
- ✅ **Filtros Inteligentes**: Filtrar por marca, categoría y estado
- ✅ **Paginación**: Navegación eficiente con paginación del lado del servidor
- ✅ **Ordenamiento**: Ordenar por cualquier columna
- ✅ **Validación**: Validación robusta con Zod en cliente y servidor

### Sistema de Categorías
- ✅ **Organización Jerárquica**: Agrupa productos por categorías
- ✅ **CRUD de Categorías**: Crear, editar y eliminar categorías
- ✅ **Filtro por Categoría**: Filtrar productos fácilmente
- ✅ **Auto-creación**: Las categorías se crean automáticamente al importar

### Generación de QR
- ✅ **Generación Client-side**: QRs generados 100% en el navegador
- ✅ **Sin Almacenamiento en Nube**: No se requiere servicio externo
- ✅ **Diseño Profesional**: QR con nombre, SKU y marca del producto
- ✅ **Impresión Directa**: Imprime QRs individualmente o en masa
- ✅ **Selección Múltiple**: Genera QRs de varios productos a la vez

### Importación y Exportación
- ✅ **CSV Import**: Importa productos desde archivos CSV
- ✅ **Validación en Tiempo Real**: Detecta errores antes de importar
- ✅ **Preview**: Vista previa de los datos antes de confirmar
- ✅ **Upsert**: Actualiza productos existentes o crea nuevos
- ✅ **Exportación**: Descarga la lista de productos en CSV

### UI/UX
- ✅ **Diseño Moderno**: Interface limpia con shadcn/ui
- ✅ **Responsive**: Funciona en móvil, tablet y desktop
- ✅ **Sidebar Colapsable**: Maximiza espacio de trabajo
- ✅ **Toasts Informativos**: Feedback visual de todas las acciones
- ✅ **Loading States**: Estados de carga en todas las operaciones
- ✅ **Sin Dependencias de Terceros**: Solo almacenamiento local

---

## 🛠️ Tecnologías

### Core
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[React 19](https://react.dev/)** - UI library

### Base de Datos
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Prisma 5.22](https://www.prisma.io/)** - ORM moderno y type-safe

### UI/Styling
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes reutilizables
- **[Lucide React](https://lucide.dev/)** - Iconos modernos
- **[Radix UI](https://www.radix-ui.com/)** - Componentes accesibles

### State Management & Data Fetching
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[React Hook Form](https://react-hook-form.com/)** - Formularios performantes
- **[Zod](https://zod.dev/)** - Validación de schemas

### Utilidades
- **[qrcode](https://www.npmjs.com/package/qrcode)** - Generación de QR codes
- **[PapaParse](https://www.papaparse.com/)** - Parser de CSV
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

---

## 📦 Instalación

### Prerrequisitos

- **Node.js 20+** ([Descargar](https://nodejs.org/))
- **pnpm** ([Instalar](https://pnpm.io/installation))
- **PostgreSQL** ([Neon](https://neon.tech), [Supabase](https://supabase.com) o local)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd showroom-app
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita `.env` y configura:

```env
# Database (obtén de Neon, Supabase o PostgreSQL local)
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"

# Magento Integration (opcional)
MAGENTO_URL="https://your-magento-url.com/rest/V1"
MAGENTO_ADMIN_USER="your-magento-username"
MAGENTO_ADMIN_PASSWORD="your-magento-password"
```

4. **Configurar base de datos**

```bash
# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# (Opcional) Abrir Prisma Studio
pnpm prisma studio
```

5. **Iniciar servidor de desarrollo**

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Estructura del Proyecto

```
showroom-app/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes (Backend)
│   │   ├── 📂 auth/                 # Autenticación (login/logout/me)
│   │   ├── 📂 products/             # CRUD de productos
│   │   ├── 📂 categories/           # CRUD de categorías
│   │   ├── 📂 export/               # Exportación CSV
│   │   ├── 📂 import/               # Importación CSV
│   │   └── 📂 magento/              # Integración con Magento
│   │
│   ├── 📂 products/                 # Página de productos
│   ├── 📂 categories/               # Página de categorías
│   ├── 📂 import/                   # Página de importación
│   ├── 📂 login/                    # Página de login
│   ├── layout.tsx                   # Layout principal
│   ├── page.tsx                     # Dashboard
│   └── globals.css                  # Estilos globales
│
├── 📂 src/                          # Código fuente
│   ├── 📂 components/               # Componentes compartidos
│   │   ├── app-layout.tsx           # Layout con sidebar
│   │   ├── sidebar.tsx              # Sidebar de navegación
│   │   └── ui/                      # shadcn/ui components
│   │
│   ├── 📂 features/                 # Features modulares (Feature-Sliced Design)
│   │   ├── 📂 products/             # Feature: Productos
│   │   │   ├── 📂 components/
│   │   │   │   ├── products-table.tsx      # Tabla de productos
│   │   │   │   ├── product-form-dialog.tsx # Form crear/editar
│   │   │   │   └── delete-product-dialog.tsx
│   │   │   ├── 📂 lib/
│   │   │   │   └── product.service.ts      # Lógica de negocio
│   │   │   ├── 📂 schemas/
│   │   │   │   └── product.schema.ts       # Validaciones Zod
│   │   │   └── 📂 hooks/
│   │   │       └── use-products.ts         # React Query hooks
│   │   │
│   │   ├── 📂 categories/           # Feature: Categorías
│   │   ├── 📂 qr/                   # Feature: Códigos QR
│   │   └── 📂 imports/              # Feature: Importación CSV
│   │
│   ├── 📂 hooks/                    # Custom hooks globales
│   └── 📂 providers/                # React providers
│
├── 📂 lib/                          # Utilidades globales
│   ├── prisma.ts                    # Cliente de Prisma
│   └── utils.ts                     # Helpers
│
├── 📂 prisma/                       # Prisma ORM
│   ├── schema.prisma                # Schema de BD
│   └── migrations/                  # Migraciones
│
├── 📂 public/                       # Archivos estáticos
│
├── .env.example                     # Variables de entorno ejemplo
├── next.config.ts                   # Configuración Next.js
├── tailwind.config.ts               # Configuración Tailwind
├── tsconfig.json                    # Configuración TypeScript
├── package.json                     # Dependencias
├── vercel.json                      # Configuración Vercel
├── README.md                        # Este archivo
└── TUTORIAL.md                      # Guía para usuarios no técnicos
```

---

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de Git

2. **Configurar variables de entorno**
   - Agrega todas las variables de `.env.example`
   - Especialmente `DATABASE_URL` y `JWT_SECRET`

3. **Configurar comando de build**
   - Ya está configurado en `vercel.json`

4. **Base de datos**
   - Crea base de datos PostgreSQL (Neon, Supabase)
   - Ejecuta migraciones en el primer deploy:
     ```bash
     pnpm prisma migrate deploy
     ```

5. **Deploy**
   - Vercel hará el deploy automático en cada push

### Variables de Entorno Requeridas

```env
# Obligatorias
DATABASE_URL="postgresql://..."
JWT_SECRET="tu-secreto-jwt"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="tu-password"

# Opcionales
MAGENTO_URL="https://..."
MAGENTO_ADMIN_USER="..."
MAGENTO_ADMIN_PASSWORD="..."
```

---

## 📖 Guía de Usuario

Para una guía completa dirigida a usuarios no técnicos, consulta el archivo **[TUTORIAL.md](./TUTORIAL.md)**.

Este tutorial incluye:
- Cómo navegar por el sistema
- Cómo crear y editar productos
- Cómo generar códigos QR
- Cómo importar productos desde Excel
- Consejos y buenas prácticas
- Solución de problemas comunes

---

## 🔐 Seguridad

- ✅ **Validación:** Zod en cliente y servidor
- ✅ **Type Safety:** TypeScript en todo el código
- ✅ **SQL Injection:** Protegido por Prisma ORM
- ✅ **XSS:** React escapa automáticamente
- ✅ **CSRF:** Next.js protección integrada
- ✅ **Env Variables:** Nunca expuestas al cliente
- ✅ **Autenticación:** JWT-based con httpOnly cookies

---

## ⚡ Performance

- ✅ **Server Components:** Renderizado en servidor cuando es posible
- ✅ **Client-side QR:** Sin llamadas al servidor para generar QRs
- ✅ **Debouncing:** Búsqueda con debounce de 300ms
- ✅ **Paginación:** Server-side pagination
- ✅ **Índices BD:** Índices optimizados en Prisma
- ✅ **TanStack Query:** Cache inteligente de datos
- ✅ **Code Splitting:** Automático con Next.js

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo

# Build
pnpm build            # Build para producción (prisma generate && next build)
pnpm start            # Iniciar servidor de producción

# Base de datos
pnpm prisma generate  # Generar cliente Prisma
pnpm prisma migrate dev    # Crear y aplicar migraciones
pnpm prisma studio         # Abrir Prisma Studio GUI
pnpm prisma migrate reset  # Resetear base de datos (⚠️ elimina datos)

# Linting
pnpm lint             # Ejecutar ESLint
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commitea tus cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👨‍💻 Autor

**maxiozonas** - Desarrollado para Giliycia

---

<div align="center">

**[⬆ Volver arriba](#-showroom-app---sistema-de-gestión-de-productos)**

</div>
