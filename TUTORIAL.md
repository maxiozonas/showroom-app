# 📚 Guía de Usuario - Sistema de Gestión de Productos

> **Una guía simple para usar el sistema sin necesidad de conocimientos técnicos**

---

## 🎯 ¿Qué es este sistema?

Este es un sistema para gestionar productos de tu negocio de manera simple y eficiente. Puedes:

- 📦 **Gestionar productos** - Agregar, editar y eliminar productos
- 📂 **Organizar por categorías** - Agrupar productos según su tipo
- 🏷️ **Generar códigos QR** - Crear códigos para imprimir y pegar en los productos
- 📥 **Importar desde Excel** - Subir muchos productos de una sola vez
- 📊 **Exportar datos** - Descargar listas de productos en Excel

---

## 🚀 Primeros pasos

### 1. Acceder al sistema

1. Abre tu navegador web (Chrome, Firefox, Safari, Edge)
2. Escribe la dirección del sistema que te proporcionaron
3. Verás la pantalla de inicio con el menú principal

### 2. Navegación básica

En el lado izquierdo verás un **menú** con estas opciones:

| Icono | Nombre | ¿Para qué sirve? |
|-------|--------|------------------|
| 📦 | **Productos** | Ver y gestionar todos los productos |
| 📂 | **Categorías** | Organizar productos por categorías |
| 📥 | **Importar** | Subir muchos productos desde un archivo |

---

## 📦 Gestión de Productos

### Ver los productos

Al entrar en **Productos** verás una tabla con toda la información:

```
┌─────────────┬──────────────────┬───────────┬───────────┬──────────┐
│   SKU       │     Nombre       │   Marca   │ Categoría │ Acciones │
├─────────────┼──────────────────┼───────────┼───────────┼──────────┤
│ ABC-001     │ Zapatilla Runner │  Nike     │ Calzado   │ [✏️] [🗑️]│
│ XYZ-123     │ Remera Algodón   │  Adidas   │ Ropa      │ [✏️] [🗑️]│
└─────────────┴──────────────────┴───────────┴───────────┴──────────┘
```

**Columnas importantes:**
- **SKU**: Código único del producto (como una "matrícula")
- **Nombre**: Nombre del producto
- **Marca**: Fabricante del producto
- **Categoría**: Grupo al que pertenece (ej: Calzado, Ropa, Accesorios)
- **Estado**: ✅ Habilitado o ❌ Deshabilitado

### Buscar productos

**¿Necesitas encontrar un producto específico?**

1. Escribe en la barra de búsqueda (arriba de la tabla)
2. Puedes buscar por:
   - SKU (ej: "ABC-001")
   - Nombre (ej: "Zapatilla")
   - Marca (ej: "Nike")
3. La tabla se actualiza automáticamente mientras escribes

### Filtrar productos

**¿Quieres ver solo ciertos productos?**

Usa los filtros arriba de la tabla:

- **Marca**: Selecciona "Nike" para ver solo productos Nike
- **Categoría**: Selecciona "Calzado" para ver solo zapatos
- **Estado**: Ver solo productos habilitados o deshabilitados

Para quitar los filtros, haz clic en **"Limpiar"**.

### Crear un producto nuevo

1. Haz clic en el botón **"+ Nuevo Producto"** (arriba a la derecha)
2. Completa el formulario:

   | Campo | ¿Qué poner? | Ejemplo |
   |-------|-------------|---------|
   | **SKU*** | Código único del producto | `ABC-001` |
   | **Nombre*** | Nombre completo | `Zapatilla Nike Air` |
   | **Marca** | Fabricante (opcional) | `Nike` |
   | **Categoría** | Selecciona una de la lista | `Calzado` |
   | **Habilitado** | ¿Se muestra en la tienda? | ✅ Sí |

   > **Nota**: Los campos con * son obligatorios

3. Haz clic en **"Guardar"**

### Editar un producto

1. Busca el producto que quieres editar
2. Haz clic en el icono de lápiz ✏️ (columna "Acciones")
3. Modifica los datos que necesites
4. Haz clic en **"Guardar"**

### Eliminar un producto

⚠️ **¡Cuidado!** Esta acción no se puede deshacer.

1. Busca el producto que quieres eliminar
2. Haz clic en el icono de basura 🗑️
3. Confirma haciendo clic en **"Eliminar"**

---

## 📂 Gestión de Categorías

Las categorías sirven para organizar tus productos. Por ejemplo:
- Calzado
- Ropa
- Accesorios
- Electrónica

### Crear una categoría

1. Ve al menú **"Categorías"**
2. Haz clic en **"+ Nueva Categoría"**
3. Completa:
   - **Nombre**: Ej. "Calzado"
   - **Slug**: Una versión simple del nombre (ej. "calzado")
4. Haz clic en **"Guardar"**

### Editar o eliminar categorías

- ✏️ **Editar**: Cambia el nombre o slug
- 🗑️ **Eliminar**: Borra la categoría (los productos quedarán sin categoría)

> **Consejo**: Planifica tus categorías al inicio. Es más fácil que reorganizar después.

---

## 🏷️ Generar Códigos QR

Los códigos QR son esos cuadrados con puntos que se pueden escanear con el celular. Sirven para:
- Pegar en productos físicos
- Que los clientes escaneen y vayan directo a la página del producto

### Generar QR para un producto

1. En la tabla de productos, busca el producto
2. Haz clic en el icono del QR (en la columna "Acciones")
3. Verás una ventana con el código QR generado

### Imprimir el QR

1. Haz clic en el botón **"Imprimir"**
2. Selecciona tu impresora
3. Configura:
   - **Tamaño del papel**: A4 o tamaño que uses
   - **Orientación**: Vertical u horizontal
   - **Márgenes**: Recomendado mínimo
4. Haz clic en **"Imprimir"**

> **Tip**: Puedes imprimir varios QRs en una sola hoja para ahorrar papel.

### Generar QRs en masa

**¿Necesitas QRs de varios productos a la vez?**

1. En la tabla de productos, selecciona los productos:
   - Haz clic en el checkbox a la izquierda de cada producto
   - O usa el checkbox del encabezado para seleccionar todos

2. Arriba de la tabla aparecerá un botón **"Generar QR (X)"**
   - La "X" indica cuántos productos seleccionaste

3. Haz clic en el botón
4. Se abrirá una ventana de impresión con todos los QRs

---

## 📥 Importar Productos desde Excel

Si tienes muchos productos, es más rápido importarlos desde un archivo Excel o CSV.

### Preparar el archivo

Tu archivo debe tener este formato:

```csv
sku,nombre,marca,url_key,habilitado,categoria
ABC-001,Zapatilla Nike Air,Nike,zapatilla-nike,true,Calzado
ABC-002,Zapatilla Adidas Run,Adidas,zapatilla-adidas,true,Calzado
ABC-003,Remera Algodón,Puma,remera-puma,true,Ropa
```

**Requisitos del archivo:**
- Formato: `.csv` (valores separados por comas)
- Codificación: UTF-8
- Primera fila: Encabezados (sku, nombre, marca, etc.)
- Campos obligatorios: **sku** y **nombre**
- Campos opcionales: marca, url_key, habilitado, categoria

**Descargar plantilla:**
1. Ve a **Importar** en el menú
2. Haz clic en **"Descargar plantilla"**
3. Completa la plantilla con tus productos
4. Guarda como archivo `.csv`

### Importar el archivo

1. Ve al menú **"Importar"**
2. Arrastra tu archivo CSV a la zona indicada
   - O haz clic y selecciona el archivo
3. Verás una **vista previa** de los datos
4. Revisa que todo esté correcto:
   - ✅ Los SKUs sean únicos
   - ✅ Los nombres estén completos
   - ✅ Las categorías existan (o se crearán nuevas)
5. Haz clic en **"Importar Productos"**
6. Espera el mensaje de éxito

### Resultados de la importación

Después de importar, verás:
- ✅ **Creados**: Productos nuevos agregados
- 🔄 **Actualizados**: Productos existentes modificados
- ❌ **Errores**: Productos que no se pudieron importar (con explicación)

> **Nota**: Si un producto ya existe (mismo SKU), se actualizará con los nuevos datos.

---

## 📊 Exportar Productos

**¿Necesitas una lista de productos en Excel?**

### Exportar desde la tabla de productos

1. Ve a la página de **Productos**
2. Aplica filtros si quieres exportar solo ciertos productos
3. Haz clic en el botón **"Exportar"** (arriba a la derecha)
4. Se descargará un archivo `.csv` con todos los productos visibles

### Qué incluye la exportación

El archivo descargado tendrá estas columnas:
- SKU
- Nombre
- Marca
- URL Key
- Categoría
- Estado (Habilitado/Deshabilitado)
- Fecha de creación
- Fecha de actualización

---

## 💡 Consejos y Buenas Prácticas

### SKUs (Códigos de producto)

- **Sé consistente**: Usa un formato similar para todos
  - ✅ Buenos ejemplos: `NIKE-001`, `CALZ-2024-001`, `ABC-001`
  - ❌ Evita: SKUs muy largos o con espacios

- **No repitas SKUs**: Cada producto debe tener un código único

- **Sé descriptivo**: Incluye información en el SKU
  - Ejemplo: `NIKE-AIR-MAX-42` (Marca-Modelo-Talle)

### Organización

1. **Crea categorías primero**: Antes de agregar productos, crea las categorías que vas a usar

2. **Usa nombres claros**: 
   - ✅ `Zapatilla Nike Air Max 90 Talle 42`
   - ❌ `Zapato`

3. **Mantén actualizado**: Si un producto no está más disponible, márcalo como "Deshabilitado" en lugar de eliminarlo

### Backups (Copias de seguridad)

- **Exporta regularmente**: Descarga la lista de productos cada cierto tiempo
- **Guarda los archivos**: Mantén copias en tu computadora o en la nube

### Códigos QR

- **Tamaño adecuado**: Imprime los QRs en un tamaño que se pueda escanear fácilmente (mínimo 2x2 cm)
- **Buena calidad**: Usa impresoras láser para mejor calidad
- **Ubicación**: Pega los QRs en lugares visibles y planos

---

## ❓ Solución de Problemas

### No puedo iniciar sesión

- Verifica que estés escribiendo la dirección correcta
- Contacta al administrador del sistema

### No aparece un producto que acabo de crear

1. **Refresca la página** (F5 o Ctrl+R)
2. Verifica que no tengas filtros activos
3. Busca el producto por su SKU exacto

### El QR no se escanea

1. **Verifica la calidad de impresión**: Los QRs borrosos no funcionan
2. **Tamaño**: Asegúrate de que el QR sea grande suficiente
3. **Contraste**: Usa papel blanco y tinta negra

### Error al importar CSV

1. **Verifica el formato**: Asegúrate de que sea archivo `.csv`
2. **Revisa los encabezados**: Deben ser: sku, nombre, marca, url_key, habilitado
3. **Campos obligatorios**: Todos los productos deben tener SKU y nombre
4. **Comas**: No uses comas dentro de los nombres (o ponlos entre comillas)

### No puedo eliminar un producto

- Verifica que tengas los permisos necesarios
- Si el producto tiene movimientos, quizás no se puede eliminar (solo deshabilitar)

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Revisa esta guía**: Busca en la sección correspondiente
2. **Contacta al administrador**: Pide ayuda a la persona que te dio acceso al sistema
3. **Describe el problema**: Cuéntale qué estabas haciendo cuando ocurrió el error

---

## 🎓 Glosario

**SKU** (Stock Keeping Unit): Código único que identifica un producto. Es como la "matrícula" del producto.

**Categoría**: Grupo que organiza productos similares. Ejemplos: Calzado, Ropa, Accesorios.

**QR**: Código de barras bidimensional que se puede escanear con el celular.

**CSV**: Formato de archivo simple para datos (se abre con Excel).

**Habilitado/Deshabilitado**: Indica si un producto está activo y visible o no.

**URL Key**: Parte de la dirección web del producto. Ejemplo: "zapatilla-nike"

**Marca**: Fabricante o marca del producto. Ejemplo: Nike, Adidas, Apple.

---

## ✅ Checklist de inicio

Si eres nuevo usando el sistema, sigue estos pasos:

- [ ] Crear las categorías principales de tu negocio
- [ ] Agregar los primeros productos manualmente
- [ ] Generar un QR de prueba y verificar que funciona
- [ ] Descargar la plantilla CSV y practicar importación
- [ ] Exportar una copia de seguridad de los productos
- [ ] Familiarizarte con la búsqueda y filtros
- [ ] Probar la generación de QRs en masa

---

**¡Listo! Ahora sabes todo lo necesario para usar el sistema. 🎉**

Recuerda: la práctica hace al maestro. No tengas miedo de explorar y probar las diferentes funciones.

---

*Última actualización: Febrero 2026*
