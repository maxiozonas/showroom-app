# 🏪 Gili Showroom App

<div align="center">

**Aplicación profesional de gestión de productos y generación de códigos QR para showroom**

Construida con Next.js 16, Prisma, UploadThing y arquitectura modular por features

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos y Componentes](#-módulos-y-componentes)
- [API Routes](#-api-routes)
- [Base de Datos](#-base-de-datos)
- [Deployment](#-deployment)
- [Scripts Disponibles](#-scripts-disponibles)

---

## Características

### Gestión de Productos
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar productos
- ✅ **Búsqueda Avanzada**: Búsqueda en tiempo real por SKU, nombre o marca
- ✅ **Filtros Inteligentes**: Filtrar por marca y estado (habilitado/deshabilitado)
- ✅ **Paginación**: Navegación eficiente con paginación del lado del servidor
- ✅ **Ordenamiento**: Ordenar por cualquier columna (SKU, nombre, marca, fecha)
- ✅ **Validación**: Validación robusta con Zod en cliente y servidor

### Importación Masiva
- ✅ **CSV Import**: Importa cientos de productos desde archivos CSV
- ✅ **Validación en Tiempo Real**: Detecta errores antes de importar
- ✅ **Preview**: Vista previa de los datos antes de confirmar
- ✅ **Manejo de Duplicados**: Actualiza productos existentes automáticamente
- ✅ **Feedback Visual**: Progreso y resultados detallados de la importación

### Generación de QR
- ✅ **QR Personalizados**: Genera códigos QR con información del producto
- ✅ **Almacenamiento en la Nube**: Sube automáticamente a UploadThing
- ✅ **Diseño Profesional**: QR con nombre, SKU y marca del producto
- ✅ **Descarga e Impresión**: Descarga PNG o imprime directamente
- ✅ **Lazy Loading**: Optimización de carga de imágenes
- ✅ **Next.js Image**: Optimización automática de imágenes

### Historial y Tracking
- ✅ **Historial Completo**: Consulta todos los QR generados
- ✅ **Búsqueda y Filtros**: Encuentra QR por producto o fecha
- ✅ **Vista Detallada**: Modal con información completa del QR
- ✅ **Re-descarga**: Descarga QR generados anteriormente
- ✅ **Performance**: Sin imágenes en cards, solo en vista detallada

### UI/UX
- ✅ **Diseño Moderno**: Interface limpia y profesional
- ✅ **Responsive**: Funciona perfectamente en móvil, tablet y desktop
- ✅ **Dark Mode Ready**: Preparado para modo oscuro
- ✅ **Sidebar Colapsable**: Maximiza espacio de trabajo
- ✅ **Toasts Informativos**: Feedback visual de todas las acciones
- ✅ **Loading States**: Estados de carga en todas las operaciones

---

## Tecnologías

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
- **[sharp](https://sharp.pixelplumbing.com/)** - Procesamiento de imágenes
- **[PapaParse](https://www.papaparse.com/)** - Parser de CSV
- **[UploadThing](https://uploadthing.com/)** - Almacenamiento de archivos
- **[date-fns](https://date-fns.org/)** - Manipulación de fechas
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

---

## Arquitectura

### Patrón de Diseño

La aplicación utiliza **arquitectura modular por features** (Feature-Sliced Design):

```
📦 Feature Module
├── 📂 components/     # Componentes UI específicos del feature
├── 📂 lib/            # Lógica de negocio y servicios
├── 📂 schemas/        # Validaciones Zod
├── 📂 hooks/          # Custom React hooks
└── 📂 api/            # Handlers de API routes (si aplica)
```

### Principios

- **Separación de Responsabilidades**: Cada feature es independiente
- **Reusabilidad**: Componentes UI compartidos en `/components/ui`
- **Type Safety**: TypeScript en todo el código
- **Server Components**: Uso de RSC cuando es posible
- **Client Components**: Solo cuando se necesita interactividad
- **API Routes**: Lógica de negocio en el servidor

---

## � Instalación

### Prerrequisitos

- **Node.js 20+** ([Descargar](https://nodejs.org/))
- **pnpm** ([Instalar](https://pnpm.io/installation))
- **PostgreSQL** ([Neon](https://neon.tech) o [Supabase](https://supabase.com) recomendado)
- **Cuenta UploadThing** ([Crear cuenta](https://uploadthing.com))

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
# Database (obtén de Neon o Supabase)
DATABASE_URL="postgresql://user:password@host:port/database"

# UploadThing (obtén de uploadthing.com/dashboard)
UPLOADTHING_TOKEN="sk_live_..."
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

## Estructura del Proyecto

```
showroom-app/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes (Backend)
│   │   ├── 📂 products/             # CRUD de productos
│   │   │   ├── route.ts             # GET (list), POST (create)
│   │   │   └── [id]/route.ts        # GET, PUT, DELETE (by ID)
│   │   ├── 📂 import/               # Importación CSV
│   │   │   └── route.ts             # POST (import CSV)
│   │   ├── 📂 qrs/                  # Generación de QR
│   │   │   └── generate/route.ts    # POST (generate QR)
│   │   ├── 📂 history/              # Historial de QR
│   │   │   ├── route.ts             # GET (list history)
│   │   │   └── [id]/route.ts        # DELETE (delete QR)
│   │   └── 📂 uploadthing/          # UploadThing config
│   │       ├── core.ts              # File router
│   │       └── route.ts             # Upload endpoint
│   ├── 📂 products/                 # Página de productos
│   │   └── page.tsx                 # Vista principal de productos
│   ├── 📂 import/                   # Página de importación
│   │   └── page.tsx                 # Vista de importación CSV
│   ├── 📂 history/                  # Página de historial
│   │   └── page.tsx                 # Vista de historial de QR
│   ├── layout.tsx                   # Layout principal
│   ├── page.tsx                     # Dashboard (redirige a /products)
│   └── globals.css                  # Estilos globales
│
├── 📂 src/                          # Código fuente
│   ├── 📂 components/               # Componentes compartidos
│   │   ├── app-layout.tsx           # Layout con sidebar
│   │   └── sidebar.tsx              # Sidebar de navegación
│   │
│   ├── 📂 features/                 # Features modulares
│   │   ├── 📂 products/             # Feature: Productos
│   │   │   ├── 📂 components/
│   │   │   │   ├── products-table.tsx      # Tabla de productos
│   │   │   │   └── product-form-dialog.tsx # Form crear/editar
│   │   │   ├── 📂 lib/
│   │   │   │   └── product.service.ts      # Lógica de negocio
│   │   │   ├── 📂 schemas/
│   │   │   │   └── product.schema.ts       # Validaciones Zod
│   │   │   └── 📂 hooks/
│   │   │       └── use-products.ts         # React Query hooks
│   │   │
│   │   ├── 📂 imports/              # Feature: Importación CSV
│   │   │   ├── 📂 components/
│   │   │   │   ├── import-form.tsx         # Form de importación
│   │   │   │   └── import-preview.tsx      # Preview de datos
│   │   │   ├── 📂 lib/
│   │   │   │   └── csv-parser.ts           # Parser CSV
│   │   │   └── 📂 schemas/
│   │   │       └── import.schema.ts        # Validaciones
│   │   │
│   │   ├── 📂 qr/                   # Feature: Códigos QR
│   │   │   ├── 📂 components/
│   │   │   │   └── generate-qr-dialog.tsx  # Dialog generar QR
│   │   │   └── 📂 lib/
│   │   │       ├── qr.service.ts           # Servicio principal
│   │   │       ├── qr-generator.ts         # Generador de QR
│   │   │       ├── qr-with-info-generator.ts # QR con info
│   │   │       └── qr-storage.service.ts   # Upload a cloud
│   │   │
│   │   └── 📂 history/              # Feature: Historial
│   │       └── 📂 components/
│   │           └── qr-history-card.tsx     # Card de QR
│   │
│   ├── 📂 hooks/                    # Custom hooks globales
│   │   ├── use-debounce.ts          # Hook de debounce
│   │   └── use-is-mobile.ts         # Hook detección móvil
│   │
│   └── 📂 providers/                # React providers
│       └── query-provider.tsx       # TanStack Query provider
│
├── 📂 components/ui/                # shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── input.tsx
│   └── ... (50+ componentes)
│
├── 📂 lib/                          # Utilidades globales
│   ├── prisma.ts                    # Cliente de Prisma
│   └── utils.ts                     # Helpers (cn, etc.)
│
├── 📂 prisma/                       # Prisma ORM
│   ├── schema.prisma                # Schema de BD
│   └── migrations/                  # Migraciones
│
├── 📂 public/                       # Archivos estáticos
│   └── gili-logo.png                # Logo de la app
│
├── 📂 scripts/                      # Scripts útiles
│   └── pre-deploy-check.sh          # Verificación pre-deploy
│
├── .env.example                     # Variables de entorno ejemplo
├── next.config.ts                   # Configuración Next.js
├── tailwind.config.ts               # Configuración Tailwind
├── tsconfig.json                    # Configuración TypeScript
├── package.json                     # Dependencias
└── vercel.json                      # Configuración Vercel
```

---

## Módulos y Componentes

### Feature: Products

**Ubicación:** `/src/features/products`

#### Componentes

##### `products-table.tsx`
- **Propósito:** Tabla principal de productos con todas las funcionalidades
- **Funcionalidades:**
  - Búsqueda en tiempo real (debounced)
  - Filtros por marca y estado
  - Paginación server-side
  - Ordenamiento por columnas
  - Acciones: Editar, Eliminar, Generar QR
- **Hooks usados:** `useProducts`, `useDebounce`
- **Estado:** Maneja búsqueda, filtros, página actual, ordenamiento

##### `product-form-dialog.tsx`
- **Propósito:** Modal para crear/editar productos
- **Validación:** React Hook Form + Zod
- **Campos:** SKU, Nombre, Marca, URL Key, Estado
- **Modos:** Crear nuevo / Editar existente

#### Servicios

##### `product.service.ts`
- **Funciones:**
  - `getProducts()` - Lista productos con filtros y paginación
  - `getProductById()` - Obtiene un producto por ID
  - `createProduct()` - Crea nuevo producto
  - `updateProduct()` - Actualiza producto existente
  - `deleteProduct()` - Elimina producto
- **Validación:** Usa schemas de Zod
- **Manejo de errores:** Try-catch con mensajes descriptivos

#### Schemas

##### `product.schema.ts`
- **Schemas Zod:**
  - `productSchema` - Validación completa de producto
  - `createProductSchema` - Para crear productos
  - `updateProductSchema` - Para actualizar productos
- **Reglas:**
  - SKU: Requerido, único
  - Nombre: Requerido, min 3 caracteres
  - Marca: Opcional
  - URL Key: Opcional
  - Estado: Boolean

---

### Feature: Imports

**Ubicación:** `/src/features/imports`

#### Componentes

##### `import-form.tsx`
- **Propósito:** Formulario de importación CSV
- **Funcionalidades:**
  - Drag & drop de archivos
  - Validación de formato CSV
  - Preview de datos
  - Progreso de importación
  - Reporte de resultados
- **Formato CSV esperado:**
  ```csv
  sku,articulo,marca,url_key,habilitado
  ABC-001,Producto 1,Marca A,producto-1,true
  ```

#### Servicios

##### `csv-parser.ts`
- **Funciones:**
  - `parseCSV()` - Parsea archivo CSV a objetos
  - `validateCSVData()` - Valida datos parseados
  - `sanitizeData()` - Limpia y normaliza datos
- **Librería:** PapaParse
- **Manejo de errores:** Detecta filas inválidas

---

### 🔲 Feature: QR

**Ubicación:** `/src/features/qr`

#### Componentes

##### `generate-qr-dialog.tsx`
- **Propósito:** Dialog para generar códigos QR
- **Flujo:**
  1. Usuario abre dialog desde tabla de productos
  2. Sistema auto-genera QR con URL del producto
  3. Muestra preview del QR generado
  4. Permite descargar o imprimir
- **Optimizaciones:**
  - Lazy loading de imágenes
  - Next.js Image optimization
  - Auto-generación al abrir

#### Servicios

##### `qr.service.ts`
- **Función principal:** `generateQr()`
- **Flujo:**
  1. Obtiene datos del producto desde BD
  2. Genera QR con información del producto
  3. Sube imagen a UploadThing
  4. Guarda registro en historial
  5. Retorna URL del QR
- **Manejo de errores:** Rollback si falla upload

##### `qr-generator.ts`
- **Función:** `generateQrCode(url)`
- **Librería:** qrcode
- **Output:** Buffer PNG
- **Configuración:**
  - Error correction: High
  - Margin: 2
  - Width: 300px

##### `qr-with-info-generator.ts`
- **Función:** `generateQrWithProductInfo()`
- **Propósito:** Genera QR con información visual del producto
- **Proceso:**
  1. Genera QR code básico
  2. Crea canvas con Sharp
  3. Agrega texto: Nombre, SKU, Marca
  4. Combina QR + texto
  5. Retorna imagen final
- **Diseño:**
  - QR centrado
  - Texto debajo del QR
  - Padding y bordes
  - Fondo blanco

##### `qr-storage.service.ts`
- **Función:** `uploadQr(sku, buffer)`
- **Servicio:** UploadThing
- **Organización:** Archivos organizados por SKU
- **Retorno:** URL pública del QR

---

### 📊 Feature: History

**Ubicación:** `/src/features/history`

#### Componentes

##### `qr-history-card.tsx`
- **Propósito:** Card que muestra un QR del historial
- **Información mostrada:**
  - Nombre del producto
  - SKU
  - Marca
  - Fecha de generación
  - URL del producto
- **Acciones:**
  - Ver QR (modal con lazy loading)
  - Descargar QR
  - Imprimir QR
  - Eliminar QR
- **Optimización:** Sin imagen en card, solo en modal

---

## 🌐 API Routes

### Products API

#### `GET /api/products`
- **Propósito:** Lista productos con filtros y paginación
- **Query params:**
  - `search` - Búsqueda por SKU/nombre/marca
  - `brand` - Filtrar por marca
  - `enabled` - Filtrar por estado
  - `page` - Número de página
  - `limit` - Items por página
  - `sortBy` - Campo para ordenar
  - `sortOrder` - asc/desc
- **Response:**
  ```json
  {
    "products": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
  ```

#### `POST /api/products`
- **Propósito:** Crear nuevo producto
- **Body:** `{ sku, name, brand?, urlKey?, enabled }`
- **Validación:** Zod schema
- **Response:** Producto creado

#### `GET /api/products/[id]`
- **Propósito:** Obtener producto por ID
- **Response:** Producto o 404

#### `PUT /api/products/[id]`
- **Propósito:** Actualizar producto
- **Body:** Campos a actualizar
- **Response:** Producto actualizado

#### `DELETE /api/products/[id]`
- **Propósito:** Eliminar producto
- **Cascade:** Elimina QRs asociados
- **Response:** 204 No Content

---

### Import API

#### `POST /api/import`
- **Propósito:** Importar productos desde CSV
- **Body:** `{ products: [...] }`
- **Proceso:**
  - Valida cada producto
  - Upsert (crea o actualiza)
  - Retorna resumen
- **Response:**
  ```json
  {
    "success": true,
    "created": 50,
    "updated": 10,
    "errors": []
  }
  ```

---

### QR API

#### `POST /api/qrs/generate`
- **Propósito:** Generar código QR para un producto
- **Body:** `{ productId, url }`
- **Proceso:**
  1. Valida producto existe
  2. Genera QR con info
  3. Sube a UploadThing
  4. Guarda en historial
- **Response:**
  ```json
  {
    "id": 1,
    "productId": 123,
    "url": "https://...",
    "qrUrl": "https://utfs.io/...",
    "createdAt": "2024-11-26T..."
  }
  ```

---

### History API

#### `GET /api/history`
- **Propósito:** Lista historial de QRs generados
- **Query params:**
  - `productId` - Filtrar por producto
  - `page` - Paginación
  - `limit` - Items por página
- **Response:** Lista de QRs con info del producto

#### `DELETE /api/history/[id]`
- **Propósito:** Eliminar QR del historial
- **Response:** 204 No Content

---

## 🗄️ Base de Datos

### Schema Prisma

#### Model: Product

```prisma
model Product {
  id        Int         @id @default(autoincrement())
  sku       String      @unique
  name      String
  brand     String?
  urlKey    String?
  enabled   Boolean     @default(true)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  qrs       QRHistory[]
  
  @@index([sku])
  @@index([name])
  @@index([brand])
  @@index([enabled])
}
```

**Campos:**
- `id` - ID autoincremental
- `sku` - Código único del producto
- `name` - Nombre del producto
- `brand` - Marca (opcional)
- `urlKey` - URL key para ecommerce
- `enabled` - Estado activo/inactivo
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `qrs` - Relación con QRHistory

**Índices:** Optimizados para búsquedas frecuentes

#### Model: QRHistory

```prisma
model QRHistory {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  qrUrl     String
  createdAt DateTime @default(now())
  
  @@index([productId])
  @@index([createdAt])
}
```

**Campos:**
- `id` - ID autoincremental
- `productId` - ID del producto
- `product` - Relación con Product
- `url` - URL del producto en ecommerce
- `qrUrl` - URL del QR en UploadThing
- `createdAt` - Fecha de generación

**Cascade:** Al eliminar producto, se eliminan sus QRs


## Componentes UI (shadcn/ui)

La aplicación usa 50+ componentes de shadcn/ui:

- **Forms:** Button, Input, Select, Checkbox, Switch
- **Data Display:** Table, Card, Badge, Avatar
- **Feedback:** Alert, Toast (Sonner), Dialog, Alert Dialog
- **Navigation:** Tabs, Dropdown Menu, Context Menu
- **Overlay:** Dialog, Sheet, Popover, Tooltip
- **Layout:** Separator, Scroll Area, Accordion

Todos los componentes están en `/components/ui` y son totalmente customizables.

---

## Seguridad

- ✅ **Validación:** Zod en cliente y servidor
- ✅ **Type Safety:** TypeScript en todo el código
- ✅ **SQL Injection:** Protegido por Prisma ORM
- ✅ **XSS:** React escapa automáticamente
- ✅ **CSRF:** Next.js protección integrada
- ✅ **Env Variables:** Nunca expuestas al cliente

---

## Performance

### Optimizaciones Implementadas

- ✅ **Server Components:** Renderizado en servidor cuando es posible
- ✅ **Lazy Loading:** Imágenes QR con loading="lazy"
- ✅ **Next.js Image:** Optimización automática de imágenes
- ✅ **Debouncing:** Búsqueda con debounce de 300ms
- ✅ **Paginación:** Server-side pagination
- ✅ **Índices BD:** Índices optimizados en Prisma
- ✅ **React Query:** Cache inteligente de datos
- ✅ **Code Splitting:** Automático con Next.js


## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Vercel Docs](https://vercel.com/docs)

---

## Licencia

Este proyecto es privado y confidencial.

---

## 👨Autor

**Maximo Ozonas** - Desarrollado para Giliycia

---

<div align="center">


</div>
