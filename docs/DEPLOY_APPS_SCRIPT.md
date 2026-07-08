# Deploy en Apps Script

1. Instala clasp: `npm install -g @google/clasp`.
2. Ejecuta `clasp login`.
3. Crea o vincula el proyecto: `clasp create --type webapp --title "Demon Jewellery" --rootDir src`.
4. Copia el scriptId en `.clasp.json` usando `.clasp.json.template` como base.
5. Ejecuta `clasp push`.
6. En Apps Script ejecuta `setup()` y acepta permisos.
7. Cambia el PIN admin con `setAdminPin('nuevo-pin')`.
8. Ve a Deploy > New deployment > Web app.
9. Configura Execute as: Me y Who has access: Anyone.
10. Copia la URL del WebApp.

## Actualizaciones

Cada cambio al backend requiere `clasp push`. El frontend remoto puede leerse desde GitHub si ejecutas:

```javascript
setupRemoteFromGitHub('soportehelpdeskusae-coder/usae', 'main')
```
