const APP = Object.freeze({
  NAME: 'Demon Jewellery',
  TAGLINE: 'Brillante Estilo',
  SHEET_ID_PROPERTY: 'DEMON_JEWELLERY_SHEET_ID',
  ADMIN_EMAIL_PROPERTY: 'DEMON_JEWELLERY_ADMIN_EMAIL',
  WHATSAPP_PROPERTY: 'DEMON_JEWELLERY_WHATSAPP',
  CURRENCY: 'MXN',
  TIMEZONE: 'America/Mexico_City'
});

function getPublicConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    appName: APP.NAME,
    tagline: APP.TAGLINE,
    currency: APP.CURRENCY,
    whatsapp: props.getProperty(APP.WHATSAPP_PROPERTY) || '',
    version: '1.0.0'
  };
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(APP.SHEET_ID_PROPERTY);
  if (id) return SpreadsheetApp.openById(id);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No se configuró la hoja de cálculo. Ejecuta setup() una vez.');
}
