/**
 * Punto de entrada de la WebApp 100% Google Apps Script.
 * El HTML, CSS y JavaScript se sirven desde los archivos del proyecto;
 * no se descargan archivos de GitHub durante la ejecución.
 */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const template = HtmlService.createTemplateFromFile('Index');

  template.app = web_getClientConfig();
  template.page = params.page || 'home';

  return template.evaluate()
    .setTitle(DJ_CONFIG.APP_NAME + ' | ' + DJ_CONFIG.TAGLINE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Inserta archivos HTML parciales del mismo proyecto de Apps Script.
 * Se utiliza para incluir Styles.html y Scripts.html dentro de Index.html.
 */
function include(filename) {
  if (!/^[A-Za-z0-9_-]+$/.test(String(filename || ''))) {
    throw new Error('Nombre de archivo no válido.');
  }
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Ejecuta esta función una vez desde el editor de Apps Script.
 * Si se proporciona una URL, la WebApp usará esa hoja de cálculo.
 */
function setup(spreadsheetUrl) {
  const ss = spreadsheetUrl
    ? db_setSpreadsheetByUrl_(spreadsheetUrl)
    : db_getSpreadsheet_();

  db_ensureSchema_();

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(DJ_CONFIG.PROPS.adminPin)) {
    props.setProperty(DJ_CONFIG.PROPS.adminPin, '1234');
  }

  audit_(
    'setup',
    'SETUP_COMPLETED',
    'Spreadsheet',
    ss.getId(),
    'Esquema inicial creado o validado para la WebApp local.'
  );

  return jsonOk_({
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    adminPinDefault: '1234',
    runtime: 'APPS_SCRIPT_ONLY'
  });
}

/**
 * Guarda explícitamente la hoja de cálculo usada por el proyecto.
 */
function configurarHoja(spreadsheetUrl) {
  if (!spreadsheetUrl) {
    throw new Error('Debes proporcionar la URL de Google Sheets.');
  }
  const ss = db_setSpreadsheetByUrl_(spreadsheetUrl);
  db_ensureSchema_();
  return jsonOk_({ spreadsheetId: ss.getId(), spreadsheetUrl: ss.getUrl() });
}

/**
 * Devuelve un diagnóstico básico para comprobar la instalación.
 */
function diagnostico() {
  const ss = db_getSpreadsheet_();
  const required = Object.keys(DJ_CONFIG.HEADERS);
  const existing = ss.getSheets().map(function(sheet) { return sheet.getName(); });
  const missing = required.filter(function(name) { return existing.indexOf(name) === -1; });

  return jsonOk_({
    appName: DJ_CONFIG.APP_NAME,
    version: DJ_CONFIG.VERSION,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    requiredSheets: required,
    missingSheets: missing,
    ready: missing.length === 0
  });
}