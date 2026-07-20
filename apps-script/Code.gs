const CONFIG = Object.freeze({
  GITHUB_RAW_URL: 'https://raw.githubusercontent.com/soportehelpdeskusae-coder/usae/main/index.html',
  SPREADSHEET_ID: '15Kd9BGsL6itd05hYyy4yQePSCn0ir5X0wtiWswNuGjI',
  CATALOG_SHEET: 'Catalogo',
  CACHE_SECONDS: 300
});

function doGet() {
  try {
    const html = obtenerFrontend_();
    return HtmlService.createHtmlOutput(html)
      .setTitle('USAE Joyería')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error(error);
    return HtmlService.createHtmlOutput('<h1>No fue posible cargar la aplicación</h1>');
  }
}

function obtenerFrontend_() {
  const cache = CacheService.getScriptCache();
  const key = 'frontend_index_v1';
  const cached = cache.get(key);
  if (cached) return cached;

  const response = UrlFetchApp.fetch(CONFIG.GITHUB_RAW_URL, {
    muteHttpExceptions: true,
    followRedirects: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('GitHub respondió con HTTP ' + response.getResponseCode());
  }

  const html = response.getContentText('UTF-8');
  cache.put(key, html, CONFIG.CACHE_SECONDS);
  return html;
}

function obtenerCatalogo() {
  const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    .getSheetByName(CONFIG.CATALOG_SHEET);

  if (!sheet) throw new Error('No existe la pestaña Catalogo.');

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1)
    .map(row => headers.reduce((obj, header, index) => {
      obj[header] = row[index];
      return obj;
    }, {}))
    .filter(item => String(item.Activo).toLowerCase() === 'true');
}

function limpiarCacheFrontend() {
  CacheService.getScriptCache().remove('frontend_index_v1');
  return true;
}
