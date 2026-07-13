function doGet() {
  const tpl = HtmlService.createTemplateFromFile('Index');
  tpl.config = getPublicConfig_();
  return tpl.evaluate()
    .setTitle(APP.NAME + ' | ' + APP.TAGLINE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setup() {
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(APP.SPREADSHEET_ID);

  props.setProperty(APP.ADMIN_EMAIL_PROPERTY, Session.getEffectiveUser().getEmail() || '');

  ensureSheet_(ss, 'Catalogo', [
    'id','nombre','descripcion','categoria','precio','existencia','imagenUrl','activo','destacado','actualizado'
  ]);
  ensureSheet_(ss, 'Pedidos', [
    'pedidoId','fecha','nombre','telefono','email','direccion','productosJson','subtotal','envio','total','estatus','notas'
  ]);
  ensureSheet_(ss, 'Configuracion', ['clave','valor']);

  return {
    ok: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    message: 'Configuración terminada usando la hoja oficial.'
  };
}

function configureStore(settings) {
  settings = settings || {};
  const props = PropertiesService.getScriptProperties();
  if (settings.adminEmail) props.setProperty(APP.ADMIN_EMAIL_PROPERTY, String(settings.adminEmail).trim());
  if (settings.whatsapp) props.setProperty(APP.WHATSAPP_PROPERTY, String(settings.whatsapp).replace(/\D/g,''));
  return {ok:true, spreadsheetId: APP.SPREADSHEET_ID};
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,headers.length).setFontWeight('bold');
  return sh;
}
