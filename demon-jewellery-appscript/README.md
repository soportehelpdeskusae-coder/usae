# Demon Jewellery — Google Sites + Apps Script + GitHub

Tienda web embebible en Google Sites, con backend en Google Apps Script y datos en Google Sheets. El repositorio Git mantiene el código y GitHub Actions puede sincronizarlo con Apps Script.

## Aplicación publicada

URL actual de la aplicación web:

https://script.google.com/macros/s/AKfycbzjWlAy0Q-GN_n6SOfLepYlW0KF5Au5AHVhetLSnUx4DQDLDYztVFqNnF_XFF0sDXNc/exec

Esta es la URL que debe incorporarse en Google Sites mediante **Insertar → Incorporar → URL**.

> Importante: el valor `AKfycb...` corresponde al identificador de la implementación web, no al `scriptId` del proyecto. Para `APPS_SCRIPT_ID` y `.clasp.json` debes usar el ID del proyecto disponible en **Configuración del proyecto → ID de secuencia de comandos** dentro de Apps Script.

## Instalación

1. Crea una hoja de cálculo de Google.
2. Abre **Extensiones → Apps Script**.
3. Copia los archivos `.gs`, `.html` y `appsscript.json`, o usa `clasp`.
4. Ejecuta una vez `setup()` y autoriza permisos.
5. Ejecuta `configureStore({whatsapp:'521XXXXXXXXXX', adminEmail:'correo@ejemplo.com'})`.
6. En la hoja `Catalogo`, agrega las URL públicas de las imágenes en la columna `imagenUrl`.

## Publicar como aplicación web

En Apps Script abre **Implementar → Nueva implementación → Aplicación web**.

- Ejecutar como: tu cuenta.
- Acceso: cualquiera.

Copia la URL terminada en `/exec`.

## Insertar en Google Sites

En Google Sites usa **Insertar → Incorporar → URL** y pega:

https://script.google.com/macros/s/AKfycbzjWlAy0Q-GN_n6SOfLepYlW0KF5Au5AHVhetLSnUx4DQDLDYztVFqNnF_XFF0sDXNc/exec

Ajusta el alto del bloque. El backend usa `setXFrameOptionsMode(ALLOWALL)` para permitir la incorporación.

## Sincronizar con GitHub usando clasp

```bash
npm install
cp .clasp.json.example .clasp.json
# coloca el scriptId real
npx clasp login
npx clasp push
```

## GitHub Actions

Configura estos secretos del repositorio:

- `APPS_SCRIPT_ID`: ID del proyecto de Apps Script.
- `CLASPRC_JSON`: contenido de `~/.clasprc.json` generado por `clasp login`.

El workflow de esta versión está preparado para ejecutarse desde la carpeta `demon-jewellery-appscript`.

## Hojas utilizadas

- `Catalogo`: productos, precio, existencia, URL de imagen y estado.
- `Pedidos`: pedidos recibidos desde el sitio.
- `Configuracion`: valores adicionales.

## Seguridad

No guardes contraseñas, tokens de pago ni claves privadas en HTML o GitHub. Usa `PropertiesService` para datos sensibles. Los precios se validan en el servidor antes de registrar cada pedido.
