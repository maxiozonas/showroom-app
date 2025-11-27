# Estructura de Cloudinary

## Organización de Archivos

Los códigos QR generados se organizan automáticamente en Cloudinary siguiendo esta estructura:

```
showroom-app/
├── {SKU_PRODUCTO_1}/
│   ├── qr-1732578900000.png
│   ├── qr-1732579200000.png
│   └── qr-1732579500000.png
├── {SKU_PRODUCTO_2}/
│   ├── qr-1732580000000.png
│   └── qr-1732580300000.png
└── {SKU_PRODUCTO_3}/
    └── qr-1732580600000.png
```

### Ejemplo Real

Si tienes un producto con SKU `ABC-001`, los QR generados para ese producto se guardarán en:

```
showroom-app/ABC-001/
├── qr-1732578900000.png
├── qr-1732579200000.png
└── qr-1732579500000.png
```

## Nomenclatura

### Carpetas
- **Carpeta raíz**: `showroom-app/`
- **Subcarpetas**: Cada producto tiene su propia carpeta nombrada con su SKU
- **Sanitización**: Los caracteres especiales en el SKU se reemplazan por guiones bajos (`_`)

### Archivos
- **Formato**: `qr-{timestamp}.png`
- **Timestamp**: Milisegundos desde epoch (Unix timestamp)
- **Extensión**: Siempre `.png`

## Contenido del QR

Cada imagen QR generada incluye:

1. **Código QR escaneab le**: En la parte superior
2. **Información del producto**: Debajo del QR
   - Nombre del producto (en negrita, tamaño más grande)
   - SKU del producto
   - Marca (si existe)

### Ejemplo Visual

```
┌─────────────────────────┐
│                         │
│   ███████████████████   │
│   ██ ▄▄▄▄▄ █▀ █ ▄▄▄▄▄  │
│   ██ █   █ █▀▄█ █   █  │
│   ██ █▄▄▄█ ██▀█ █▄▄▄█  │
│   ██▄▄▄▄▄▄▄█ ▀ █▄▄▄▄▄  │
│   ███████████████████   │
│                         │
├─────────────────────────┤
│   Producto Ejemplo      │  ← Nombre (negrita)
│   SKU: ABC-001          │  ← SKU
│   Marca: Mi Marca       │  ← Marca (opcional)
└─────────────────────────┘
```

## Configuración

### Variables de Entorno

```env
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

### Parámetros de Generación

Los QR se generan con los siguientes parámetros por defecto:

```typescript
{
  qrSize: 400,           // Tamaño del QR en píxeles
  padding: 40,           // Padding alrededor del contenido
  fontSize: 16,          // Tamaño de fuente para la info
  backgroundColor: '#FFFFFF',  // Fondo blanco
  textColor: '#000000'   // Texto negro
}
```

## Ventajas de esta Estructura

1. **Organización**: Fácil encontrar todos los QR de un producto específico
2. **Escalabilidad**: Cada producto tiene su propia carpeta, evitando carpetas con miles de archivos
3. **Trazabilidad**: El timestamp permite saber cuándo se generó cada QR
4. **Limpieza**: Fácil eliminar QR antiguos de un producto específico
5. **Búsqueda**: Cloudinary permite buscar por carpeta/SKU fácilmente

## Gestión de QR Antiguos

Si necesitas limpiar QR antiguos de un producto:

1. Ve a tu dashboard de Cloudinary
2. Navega a `Media Library > showroom-app > {SKU}`
3. Selecciona los QR antiguos que quieras eliminar
4. Elimínalos manualmente

O usa la API de Cloudinary para automatizar la limpieza:

```typescript
import { v2 as cloudinary } from 'cloudinary'

// Eliminar todos los QR de un producto
await cloudinary.api.delete_resources_by_prefix(`showroom-app/${sku}/`)

// Eliminar un QR específico
await cloudinary.uploader.destroy(`showroom-app/${sku}/qr-${timestamp}`)
```

## Límites y Consideraciones

- **Límite de archivos**: Cloudinary tiene límites según tu plan
- **Tamaño de imagen**: Cada QR pesa aproximadamente 50-100 KB
- **Nombres de carpeta**: Los SKU con caracteres especiales se sanitizan automáticamente
- **Duplicados**: Los QR nunca se sobrescriben (overwrite: false)

## Troubleshooting

### Error: "Cloudinary no está configurado"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que `.env.local` esté en la raíz del proyecto

### Error al subir imagen
- Verifica tus credenciales de Cloudinary
- Revisa los límites de tu plan de Cloudinary
- Asegúrate de tener conexión a internet

### SKU con caracteres especiales
- Los caracteres no alfanuméricos se reemplazan automáticamente por `_`
- Ejemplo: `ABC/001-X` → `ABC_001-X`
