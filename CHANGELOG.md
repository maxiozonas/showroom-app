# Changelog

## [1.1.0] - Mejoras en Generación de QR

### ✨ Nuevas Características

#### Organización en Cloudinary por SKU
- Los QR codes ahora se organizan automáticamente en carpetas por SKU
- Estructura: `showroom-app/{SKU}/qr-{timestamp}.png`
- Facilita la gestión y búsqueda de QR por producto

#### QR con Información del Producto
- Los QR generados ahora incluyen información visual del producto:
  - Código QR escaneab le (400x400px)
  - Nombre del producto (en negrita)
  - SKU del producto
  - Marca (si existe)
- Diseño profesional con padding y borde decorativo

### 🔧 Cambios Técnicos

#### Nuevas Dependencias
- `sharp@0.34.5` - Para composición de imágenes (reemplaza canvas por mejor compatibilidad) y gráficos

#### Nuevos Archivos
- `src/features/qr/lib/qr-with-info-generator.ts` - Generador de QR con información
- `docs/CLOUDINARY_STRUCTURE.md` - Documentación de estructura en Cloudinary

#### Archivos Modificados
- `src/features/qr/lib/cloudinary-upload.ts` - Organización por carpetas SKU
- `src/features/qr/lib/qr.service.ts` - Uso del nuevo generador
- `src/features/qr/components/generate-qr-dialog.tsx` - Preview mejorado
- `README.md` - Documentación actualizada

### 📋 Configuración

Los QR se generan con estos parámetros por defecto:
```typescript
{
  qrSize: 400,           // Tamaño del QR
  padding: 40,           // Espaciado
  fontSize: 16,          // Tamaño de texto
  backgroundColor: '#FFFFFF',
  textColor: '#000000'
}
```

### 🎨 Ejemplo de Estructura en Cloudinary

```
showroom-app/
├── ABC-001/
│   ├── qr-1732578900000.png
│   └── qr-1732579200000.png
├── XYZ-500/
│   └── qr-1732580000000.png
└── DEF-250/
    ├── qr-1732580300000.png
    └── qr-1732580600000.png
```

---

## [1.0.0] - Release Inicial

### ✨ Características Principales

- **Gestión de Productos**: CRUD completo con búsqueda, filtros y paginación
- **Importación CSV**: Carga masiva de productos desde archivos CSV
- **Generación de QR**: Códigos QR que dirigen al ecommerce
- **Historial**: Consulta de todos los QR generados
- **Descarga e Impresión**: Funcionalidad de descarga e impresión de QR

### 🛠️ Stack Tecnológico

- Next.js 16 (App Router)
- Prisma 5.22.0 + PostgreSQL
- TailwindCSS + shadcn/ui
- Cloudinary
- Zod para validación
- PapaParse para CSV
- qrcode para generación de QR

### 📁 Arquitectura

- Arquitectura modular por features
- Separación clara de responsabilidades
- API Routes organizadas
- Componentes reutilizables
