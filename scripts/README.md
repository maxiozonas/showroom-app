# Scripts de Mantenimiento

Scripts utilitarios para el mantenimiento de la aplicación.

## 🗑️ Eliminación de QRs

### Script Automático (Sin Confirmación)

**Archivo:** `delete-all-qrs.ts`

Elimina **todos** los QRs de la base de datos y UploadThing sin pedir confirmación.

```bash
pnpm delete-qrs
```

**⚠️ ADVERTENCIA:** Este script elimina TODOS los QRs inmediatamente sin confirmación. Úsalo solo si estás completamente seguro.

**Qué hace:**
1. ✅ Obtiene todos los QRs de la base de datos
2. ✅ Extrae las keys de UploadThing de las URLs
3. ✅ Elimina archivos de UploadThing en lotes de 100
4. ✅ Elimina todos los registros de la base de datos
5. ✅ Muestra resumen de la operación

---

### Script Seguro (Con Confirmación)

**Archivo:** `delete-all-qrs-safe.ts`

Elimina todos los QRs pero **pide confirmación** antes de proceder.

```bash
pnpm delete-qrs-safe
```

**✅ RECOMENDADO:** Este script es más seguro porque:
- Muestra cuántos QRs se van a eliminar
- Pide confirmación dos veces
- Requiere escribir "SI" y "ELIMINAR" para proceder
- Muestra progreso detallado

**Flujo de confirmación:**
```
⚠️  Se encontraron 150 QRs que serán eliminados
   - Se eliminarán de la base de datos
   - Se eliminarán de UploadThing
   - Esta acción NO se puede deshacer

¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): SI

⚠️  Última confirmación: Se eliminarán 150 QRs. Escribe "ELIMINAR" para continuar: ELIMINAR

🚀 Iniciando eliminación...
```

---

## 📊 Salida del Script

Ambos scripts muestran información detallada:

```
🚀 Iniciando limpieza de QRs...

📊 Obteniendo QRs de la base de datos...
✅ Encontrados 150 QRs en la base de datos

🔍 Extrayendo keys de UploadThing...
✅ Extraídas 150 keys de UploadThing

🗑️  Eliminando archivos de UploadThing...
   ✓ Eliminados 100/150 archivos
   ✓ Eliminados 150/150 archivos
✅ Eliminados 150 archivos de UploadThing

🗑️  Eliminando registros de la base de datos...
✅ Eliminados 150 registros de la base de datos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LIMPIEZA COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 QRs encontrados:        150
🗑️  Archivos eliminados:   150
💾 Registros eliminados:   150
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Requisitos

- Node.js instalado
- Dependencias instaladas (`pnpm install`)
- Variables de entorno configuradas:
  - `DATABASE_URL` - Conexión a PostgreSQL
  - `UPLOADTHING_SECRET` - API key de UploadThing

---

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar

1. **Backup de la base de datos** (recomendado)
   ```bash
   pg_dump -U usuario -d nombre_db > backup_qrs.sql
   ```

2. **Verificar entorno**
   - Asegúrate de estar en el entorno correcto (dev/prod)
   - Verifica que las variables de entorno estén configuradas

3. **Considerar el impacto**
   - Los productos perderán sus QRs asociados
   - Los usuarios no podrán acceder a QRs antiguos
   - Esta acción NO se puede deshacer

### Durante la Ejecución

- El script procesa archivos en lotes de 100
- Puede tomar varios minutos si hay muchos QRs
- No interrumpas el proceso una vez iniciado

### Después de Ejecutar

- Los productos seguirán existiendo (solo se eliminan los QRs)
- Puedes generar nuevos QRs normalmente
- El campo `hasQrs` de los productos se actualizará automáticamente

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
pnpm install
```

### Error: "Database connection failed"
Verifica tu `DATABASE_URL` en `.env`

### Error: "UploadThing authentication failed"
Verifica tu `UPLOADTHING_SECRET` en `.env`

### Algunos archivos no se eliminaron
- Puede ser que algunos archivos ya no existan en UploadThing
- El script continúa con los demás archivos
- Los registros de la DB se eliminan de todas formas

---

## 📝 Casos de Uso

### 1. Regenerar todos los QRs con nuevo diseño
```bash
# 1. Eliminar QRs antiguos
pnpm delete-qrs-safe

# 2. Los usuarios generarán nuevos QRs con el diseño actualizado
```

### 2. Limpiar QRs de prueba
```bash
# Eliminar todos los QRs generados durante testing
pnpm delete-qrs-safe
```

### 3. Cambiar de proveedor de almacenamiento
```bash
# Eliminar QRs de UploadThing antes de migrar
pnpm delete-qrs-safe
```

---

## 🔐 Seguridad

- ✅ Los scripts requieren acceso a la base de datos
- ✅ Los scripts requieren API key de UploadThing
- ✅ No exponen información sensible en logs
- ✅ Versión segura requiere confirmación explícita
- ⚠️ No ejecutar en producción sin backup

---

## 📞 Soporte

Si tienes problemas con los scripts:

1. Verifica los logs de error
2. Asegúrate de tener las dependencias instaladas
3. Verifica las variables de entorno
4. Revisa la conexión a la base de datos
5. Verifica tu cuenta de UploadThing

---

**Última actualización:** Noviembre 2025
