# Sincronización GitHub + Apps Script

Apps Script puede leer HTML/CSS/JS como texto desde GitHub, pero el código backend `.gs` debe existir en el proyecto Apps Script desplegado. Por eso el repositorio usa dos capas:

1. Backend `.gs`: se sube con `clasp push`.
2. Frontend remoto y assets: se leen desde GitHub con caché.

## Configurar remoto

En Apps Script ejecuta:

```javascript
setupRemoteFromGitHub('soportehelpdeskusae-coder/usae', 'main')
```

Para volver al frontend local:

```javascript
disableRemoteHtml()
```

## Assets

Si el repositorio es público, las imágenes pueden leerse desde:

```text
https://raw.githubusercontent.com/soportehelpdeskusae-coder/usae/main/assets/img/archivo.jpg
```

También puedes definir una URL pública con:

```javascript
setPublicAssetsBaseUrl('https://TU_DOMINIO/assets/')
```
