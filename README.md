# Demon Jewellery — WebApp 100% Google Apps Script

Aplicación web para **Demon Jewellery | Brillante Estilo** ejecutada completamente en Google Apps Script y conectada a Google Sheets.

El repositorio se usa únicamente para versionar y desplegar el proyecto con `clasp`. La WebApp no descarga HTML, CSS, JavaScript ni configuración desde GitHub durante su ejecución.

## Funciones incluidas

- Catálogo público alimentado desde la hoja `Catalogo`.
- Búsqueda y filtros por categoría.
- Registro de pedidos con folio y referencia de pago.
- Solicitudes de diseños personalizados.
- Seguimiento por folio y dato de contacto.
- Panel administrativo protegido por PIN.
- Registro de auditoría en Google Sheets.
- Interfaz adaptable para celular, tableta y escritorio.
- Integración de contacto por WhatsApp.

## Arquitectura

```text
src/
├── Code.gs          Entrada de la WebApp, setup y diagnóstico
├── Config.gs        Configuración general
├── Database.gs      Acceso y esquema de Google Sheets
├── Catalogo.gs      Catálogo público
├── Pedidos.gs       Pedidos, diseños y seguimiento
├── Admin.gs         Operaciones administrativas
├── Index.html       Interfaz principal
├── Styles.html      Estilos incluidos localmente
├── Scripts.html     JavaScript incluido localmente
└── appsscript.json  Manifiesto de Apps Script
```

Los archivos bajo `frontend/`, `assets/` o módulos remotos antiguos no son necesarios para ejecutar esta versión.

## Requisitos

- Cuenta de Google.
- Node.js instalado.
- `clasp` instalado.
- Una hoja de cálculo de Google Sheets.

## Instalación con clasp

### 1. Instalar clasp

```bash
npm install -g @google/clasp
clasp login
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/soportehelpdeskusae-coder/usae.git
cd usae
git checkout agent/appscript-only
```

### 3. Crear un proyecto nuevo de Apps Script

Desde la raíz del repositorio:

```bash
clasp create --type webapp --title "Demon Jewellery" --rootDir src
```

Esto crea el archivo `.clasp.json` con el `scriptId` del proyecto.

Para usar un proyecto existente, crea `.clasp.json` con:

```json
{
  "scriptId": "TU_SCRIPT_ID",
  "rootDir": "src"
}
```

### 4. Subir el código

```bash
clasp push
```

### 5. Configurar Google Sheets

Abre el proyecto en Apps Script:

```bash
clasp open
```

Ejecuta una vez una de estas opciones:

```javascript
setup('https://docs.google.com/spreadsheets/d/ID_DE_TU_HOJA/edit');
```

O, si el proyecto está vinculado directamente a una hoja:

```javascript
setup();
```

La función crea o valida estas pestañas:

- `Catalogo`
- `Pedidos`
- `Disenos`
- `Clientes`
- `Auditoria`
- `Configuracion`

El PIN administrativo inicial es `1234`. Cámbialo antes de publicar:

```javascript
setAdminPin('UN_PIN_SEGURO');
```

### 6. Comprobar la instalación

Ejecuta:

```javascript
diagnostico();
```

El resultado debe indicar:

```javascript
ready: true
```

### 7. Desplegar como aplicación web

En Apps Script:

1. Abre **Implementar > Nueva implementación**.
2. Selecciona **Aplicación web**.
3. En **Ejecutar como**, selecciona tu cuenta.
4. En **Quién tiene acceso**, selecciona **Cualquier persona**.
5. Pulsa **Implementar**.

También puedes desplegar con `clasp`:

```bash
clasp version "Primera versión Apps Script"
clasp deploy --description "Demon Jewellery WebApp"
```

## Configuración inicial del catálogo

En la hoja `Catalogo`, usa las columnas creadas por `setup()`.

Campos principales:

- `productId`: identificador único, por ejemplo `DJ-001`.
- `nombre`: nombre comercial.
- `categoria`: collar, anillo, pulsera, dije, etc.
- `descripcion`: descripción del producto.
- `material`: plata, acero, chapa, etc.
- `precioMXN`: precio numérico.
- `stock`: cantidad disponible.
- `imagen`: URL HTTPS pública de la fotografía.
- `tags`: palabras separadas por comas.
- `activo`: `SI` para mostrarlo.
- `destacado`: `SI` para usarlo como producto destacado.

Las imágenes pueden estar en Google Drive con enlace público, Google Photos mediante una URL directa o cualquier alojamiento HTTPS. Si una imagen no está disponible, la interfaz muestra un marcador gráfico integrado.

## Actualizar la aplicación

Después de modificar archivos dentro de `src/`:

```bash
clasp push
clasp version "Descripción del cambio"
clasp deploy --deploymentId TU_DEPLOYMENT_ID --description "Actualización"
```

## Seguridad

- Cambia el PIN administrativo inicial.
- No guardes contraseñas, tokens o claves privadas en `Config.gs`.
- Usa Propiedades del script para información sensible.
- Limita la edición de la hoja de cálculo a personal autorizado.
- Revisa periódicamente la hoja `Auditoria`.
- La aplicación solicita únicamente permisos de Google Sheets e identificación básica del usuario ejecutor.

## Archivos de ejecución

La versión 100% Apps Script utiliza directamente:

- `src/Code.gs`
- `src/Config.gs`
- `src/Database.gs`
- `src/Catalogo.gs`
- `src/Pedidos.gs`
- `src/Admin.gs`
- `src/Index.html`
- `src/Styles.html`
- `src/Scripts.html`
- `src/appsscript.json`
