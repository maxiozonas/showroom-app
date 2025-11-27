# 📊 Análisis: Carga Masiva de Productos (9000+ productos)

## **🔍 Situación Actual**

### **Flujo de Importación:**
```
1. Usuario sube CSV
2. parseCSV() valida y parsea todas las filas
3. importProductsBatch() procesa en batch
4. Respuesta con resultado
```

### **Método Actual: `importProductsBatch()`**

**Ventajas:**
- ✅ Usa `createMany()` - Más rápido que crear uno por uno
- ✅ `skipDuplicates: true` - Evita errores por duplicados
- ✅ Una sola query para obtener SKUs existentes
- ✅ Actualiza productos existentes

**Código Actual:**
```typescript
// 1. Obtener todos los SKUs existentes (1 query)
const existingProducts = await prisma.product.findMany({
  where: { sku: { in: rows.map(r => r.sku) } },
  select: { sku: true, id: true },
})

// 2. Separar nuevos vs existentes
const toCreate = [] // Productos nuevos
const toUpdate = [] // Productos existentes

// 3. Crear todos los nuevos en batch (1 query)
await prisma.product.createMany({
  data: toCreate,
  skipDuplicates: true,
})

// 4. Actualizar existentes (N queries)
for (const update of toUpdate) {
  await prisma.product.update(update)
}
```

---

## **⚠️ Problemas con 9000 Productos**

### **1. Timeout del Servidor** 🕐
```
9000 productos × ~50ms por producto = 450 segundos (7.5 minutos)
Timeout típico de Vercel/Next.js: 60 segundos
Resultado: ❌ Request timeout
```

### **2. Memoria** 💾
```
9000 productos × ~1KB por producto = 9MB en memoria
+ Parsing CSV
+ Validación Zod
+ Queries Prisma
Resultado: ~30-50MB en memoria (puede causar problemas)
```

### **3. Experiencia de Usuario** 😰
```
Usuario sube CSV → Espera... → Espera... → Timeout
No hay feedback de progreso
No sabe cuántos se procesaron
```

### **4. Actualizaciones Lentas** 🐌
```
Si hay 5000 productos existentes:
for (const update of toUpdate) {  // 5000 iteraciones
  await prisma.product.update()   // 1 query por iteración
}
= 5000 queries individuales = MUY LENTO
```

---

## **✅ Soluciones Recomendadas**

### **Opción 1: Procesamiento en Background (RECOMENDADO)** 🚀

**Implementación:**
```typescript
// 1. Usuario sube CSV
// 2. Crear un "Job" en la BD
// 3. Responder inmediatamente con Job ID
// 4. Procesar en background
// 5. Usuario puede ver progreso en tiempo real
```

**Ventajas:**
- ✅ Sin timeouts
- ✅ Feedback de progreso en tiempo real
- ✅ Usuario puede seguir usando la app
- ✅ Reintentos automáticos si falla

**Stack Sugerido:**
- **BullMQ** + Redis (mejor opción)
- **Inngest** (serverless, fácil)
- **Trigger.dev** (alternativa moderna)

---

### **Opción 2: Chunking + Streaming** 📦

**Implementación:**
```typescript
// Procesar en chunks de 500 productos
const CHUNK_SIZE = 500
for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
  const chunk = rows.slice(i, i + CHUNK_SIZE)
  await processChunk(chunk)
  // Enviar progreso al cliente
}
```

**Ventajas:**
- ✅ Más simple que background jobs
- ✅ Feedback de progreso
- ✅ Menos memoria por chunk

**Desventajas:**
- ⚠️ Puede seguir teniendo timeout con 9000 productos
- ⚠️ Usuario debe mantener la página abierta

---

### **Opción 3: Optimizar Batch Actual** ⚡

**Mejoras Inmediatas:**

#### **A. Usar `updateMany` en lugar de loop**
```typescript
// ANTES (LENTO):
for (const update of toUpdate) {
  await prisma.product.update(update)  // N queries
}

// DESPUÉS (RÁPIDO):
await prisma.$transaction(
  toUpdate.map(update => 
    prisma.product.update(update)
  )
) // 1 transacción con N updates en paralelo
```

#### **B. Aumentar límite de tamaño**
```typescript
// next.config.ts
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumentar de 1mb a 10mb
    },
  },
}
```

#### **C. Optimizar queries con índices**
```prisma
// Ya implementado ✅
@@index([sku])
```

---

## **🎯 Recomendación Final**

### **Para Carga Inicial (9000 productos):**
**Opción 1: Background Jobs** 

**Razones:**
1. Sin timeouts
2. Progreso en tiempo real
3. Escalable a 50,000+ productos
4. Mejor UX

### **Para Cargas Semanales (100-500 productos nuevos):**
**Opción 3: Batch Optimizado**

**Razones:**
1. Más simple
2. Suficientemente rápido
3. No requiere infraestructura adicional
4. Ya está implementado

---

## **📋 Plan de Implementación**

### **Fase 1: Optimización Inmediata (1-2 horas)**
```typescript
// 1. Optimizar updates con transacción
await prisma.$transaction(
  toUpdate.map(update => prisma.product.update(update))
)

// 2. Aumentar límite de tamaño
// next.config.ts

// 3. Agregar timeout más largo en Vercel
// vercel.json
{
  "functions": {
    "app/api/import/route.ts": {
      "maxDuration": 300 // 5 minutos
    }
  }
}
```

**Resultado:** Puede manejar ~2000-3000 productos

---

### **Fase 2: Background Jobs (1-2 días)**

#### **Estructura:**
```
1. POST /api/import
   → Crear Job en BD
   → Responder con Job ID
   → Trigger background worker

2. Background Worker
   → Procesar en chunks de 500
   → Actualizar progreso en BD
   → Notificar al cliente

3. GET /api/import/[jobId]
   → Obtener estado del job
   → { status, progress, created, errors }

4. Frontend
   → Polling cada 2 segundos
   → Mostrar barra de progreso
   → Notificar cuando termine
```

#### **Schema de Job:**
```prisma
model ImportJob {
  id          String   @id @default(cuid())
  status      String   // pending, processing, completed, failed
  progress    Int      @default(0)
  total       Int
  created     Int      @default(0)
  updated     Int      @default(0)
  errors      Json     @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## **🧪 Testing con 9000 Productos**

### **Test 1: Carga Inicial**
```bash
# Generar CSV de prueba
node scripts/generate-test-csv.js 9000

# Importar
curl -X POST http://localhost:3000/api/import \
  -F "file=@test-9000.csv"

# Medir tiempo
# Esperado con Fase 1: ~3-5 minutos
# Esperado con Fase 2: ~2-3 minutos (background)
```

### **Test 2: Carga Semanal (500 nuevos)**
```bash
# 500 productos nuevos + 8500 existentes
# Esperado: ~30-60 segundos
```

---

## **💰 Costos**

### **Opción 1: Background Jobs**
- **BullMQ + Redis:** ~$10-20/mes (Upstash Redis)
- **Inngest:** Free tier hasta 50k eventos/mes
- **Trigger.dev:** Free tier hasta 100k runs/mes

### **Opción 2: Chunking**
- **Costo:** $0 (solo Next.js)
- **Limitación:** Timeouts en Vercel

### **Opción 3: Optimización**
- **Costo:** $0
- **Limitación:** ~2000-3000 productos máximo

---

## **📊 Comparación**

| Aspecto | Batch Actual | Batch Optimizado | Background Jobs |
|---------|--------------|------------------|-----------------|
| **Productos máx** | ~1000 | ~2500 | ∞ (ilimitado) |
| **Tiempo 9000** | Timeout ❌ | Timeout ❌ | 2-3 min ✅ |
| **Tiempo 500** | 30s | 15s | 20s |
| **UX** | Espera ciega | Espera ciega | Progreso en tiempo real |
| **Complejidad** | Simple | Simple | Media |
| **Costo** | $0 | $0 | ~$10/mes |
| **Escalabilidad** | Baja | Media | Alta |

---

## **🎯 Decisión Recomendada**

### **Para tu caso (cargas semanales de productos nuevos):**

**Implementar Fase 1 (Optimización) AHORA:**
- ✅ Rápido de implementar (1-2 horas)
- ✅ Sin costos adicionales
- ✅ Suficiente para 500-1000 productos semanales
- ✅ Mejora inmediata

**Implementar Fase 2 (Background Jobs) DESPUÉS:**
- ✅ Solo si necesitas carga inicial de 9000
- ✅ O si las cargas semanales crecen a 2000+
- ✅ Mejor UX para el futuro

---

## **🚀 Código de Optimización Inmediata**

### **1. Optimizar Updates:**
```typescript
// src/features/imports/lib/import.service.ts

// REEMPLAZAR:
for (const update of toUpdate) {
  await prisma.product.update(update)
  result.updated++
}

// CON:
if (toUpdate.length > 0) {
  await prisma.$transaction(
    toUpdate.map(update => 
      prisma.product.update(update)
    )
  )
  result.updated = toUpdate.length
}
```

### **2. Aumentar Timeout (Vercel):**
```json
// vercel.json
{
  "functions": {
    "app/api/import/route.ts": {
      "maxDuration": 300
    }
  }
}
```

### **3. Aumentar Body Size:**
```typescript
// next.config.ts
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
```

---

**¿Quieres que implemente la Fase 1 (optimización inmediata) ahora?** 🚀
