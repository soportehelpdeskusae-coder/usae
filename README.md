# Demon Jewellery — Apps Script WebApp

Sitio web completo para **Demon Jewellery | Brillante Estilo** con catálogo, pedidos, solicitudes de diseños personalizados, panel admin básico y almacenamiento en Google Sheets.

## Qué incluye

- Catálogo público alimentado desde la hoja `Catalogo`.
- Formulario de compra con folio, referencia de pago y apertura automática de WhatsApp.
- Formulario de diseño personalizado con presupuesto, material, talla e imagen de referencia.
- Consulta de pedido por folio + correo/WhatsApp.
- Panel admin protegido por PIN para ver pedidos y diseños.
- Auditoría de acciones en la hoja `Auditoria`.
- Soporte para cargar HTML/CSS/JS y assets desde GitHub.
- Assets incluidos en `/assets/img` y manifiesto en `/assets/manifest.json`.

## Estructura

```text
src/                 Archivos que se suben a Apps Script con clasp
frontend/            Copia remota del frontend para leerse desde GitHub
assets/img/          Imágenes y logo de Demon Jewellery
assets/manifest.json Manifiesto de imágenes
assets-base64/       Respaldo textual de assets para GitHub si no se suben binarios
docs/                Guías de instalación y esquema de hojas
```

## Instalación rápida con clasp

1. Instala clasp:

```bash
npm install -g @google/clasp
clasp login
```

2. Crea un proyecto Apps Script o usa uno existente.

```bash
clasp create --type webapp --title "Demon Jewellery" --rootDir src
```

3. Copia el `scriptId` generado en `.clasp.json`. Puedes partir de `.clasp.json.template`.

4. Sube el código:

```bash
clasp push
```

5. En Apps Script, ejecuta una vez:

```javascript
setup()
```

El sistema creará o validará las hojas `Catalogo`, `Pedidos`, `Disenos`, `Clientes`, `Auditoria` y `Configuracion`.

6. Despliega como WebApp:

- Ejecutar como: tu usuario.
- Acceso: cualquier persona.

## Conectar el sitio a GitHub para cargar frontend y assets

Después de subir el repositorio a GitHub, ejecuta en Apps Script:

```javascript
setupRemoteFromGitHub('soportehelpdeskusae-coder/usae', 'main')
```

Para repositorio privado:

```javascript
setupRemoteFromGitHub('soportehelpdeskusae-coder/usae', 'main', 'GITHUB_TOKEN_SOLO_LECTURA')
```

El backend `.gs` debe estar desplegado en Apps Script; Apps Script no puede reemplazar de forma segura todo el backend desde GitHub en tiempo real. El flujo correcto es:

- Código `.gs`: versionado en GitHub y desplegado con `clasp push`.
- HTML/CSS/JS/assets: pueden cargarse desde GitHub con `DJ_USE_REMOTE_HTML=true`.
- Base de datos: se mantiene en Google Sheets.

## Cambiar PIN admin

Ejecuta en Apps Script:

```javascript
setAdminPin('TU_PIN_NUEVO')
```

El PIN inicial generado por `setup()` es `1234`. Cámbialo antes de producción.

## Editar catálogo

Edita la hoja `Catalogo`. Campos importantes:

- `activo`: usa `SI` para mostrar el producto.
- `destacado`: usa `SI` para marcar destacado.
- `imagen`: puede ser URL completa o ruta relativa como `img/producto_01.jpg`.
- `precioMXN`: usa número. Si es `0`, el sitio muestra `A cotizar`.

## Assets incluidos

Las imágenes principales pueden subirse a `assets/img`. También se puede usar el respaldo textual en `assets-base64/` para conservar todos los recursos dentro de GitHub aunque el conector no permita escribir binarios.

## GitHub Pages / raw assets

Si el repositorio es público, las imágenes se cargan con:

```text
https://raw.githubusercontent.com/OWNER/REPO/main/assets/img/archivo.jpg
```

Si quieres usar GitHub Pages o CDN, ejecuta:

```javascript
setPublicAssetsBaseUrl('https://OWNER.github.io/REPO/assets/')
```

## Archivos principales

- `src/Code.gs`: entrada WebApp y setup.
- `src/Config.gs`: configuración global.
- `src/GitHubRemote.gs`: lectura remota desde GitHub.
- `src/Database.gs`: esquema y utilidades de Sheets.
- `src/Catalogo.gs`: API pública del catálogo.
- `src/Pedidos.gs`: compras, diseños y seguimiento.
- `src/Admin.gs`: panel interno.
- `src/Index.html`, `src/Styles.html`, `src/Scripts.html`: frontend local.
- `frontend/*`: frontend remoto para GitHub.
