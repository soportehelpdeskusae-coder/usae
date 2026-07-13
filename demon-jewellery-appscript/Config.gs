const APP = Object.freeze({
  NAME: 'Demon Jewellery',
  TAGLINE: 'Brillante Estilo',
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzjWlAy0Q-GN_n6SOfLepYlW0KF5Au5AHVhetLSnUx4DQDLDYztVFqNnF_XFF0sDXNc/exec',
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1ToFzphgQnYhCL1NH6ekC101SrSUCysTaTTYqvJ296Kw/edit?usp=drivesdk',
  SPREADSHEET_ID: '1ToFzphgQnYhCL1NH6ekC101SrSUCysTaTTYqvJ296Kw',
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
    webAppUrl: APP.WEB_APP_URL,
    spreadsheetUrl: APP.SPREADSHEET_URL,
    currency: APP.CURRENCY,
    whatsapp: props.getProperty(APP.WHATSAPP_PROPERTY) || '',
    version: '1.0.2'
  };
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const configuredId = props.getProperty(APP.SHEET_ID_PROPERTY);

  // Permite una configuración manual, pero usa la hoja fija del proyecto por defecto.
  if (configuredId) return SpreadsheetApp.openById(configuredId);
  return SpreadsheetApp.openByUrl(APP.SPREADSHEET_URL);
}
