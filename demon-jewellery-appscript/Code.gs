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
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) ss = SpreadsheetApp.create('Demon Jewellery - Tienda');

  props.setProperty(APP.SHEET_ID_PROPERTY, ss.getId());
  props.setProperty(APP.ADMIN_EMAIL_PROPERTY, Session.getEffectiveUser().getEmail() || '');

  ensureSheet_(ss, 'Catalogo', [
    'id','nombre','descripcion','categoria','precio','existencia','imagenUrl','activo','destacado','actualizado'
  ]);
  ensureSheet_(ss, 'Pedidos', [
    'pedidoId','fecha','nombre','telefono','email','direccion','productosJson','subtotal','envio','total','estatus','notas'
  ]);
  ensureSheet_(ss, 'Configuracion', ['clave','valor']);

  const catalogo = ss.getSheetByName('Catalogo');
  if (catalogo.getLastRow() === 1) {
    const now = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    catalogo.getRange(2,1,4,10).setValues([
      ['DJ-001','Collar Hello Kitty','Collar plateado con dije brillante.','Collares',399,10,'',true,true,now],
      ['DJ-002','Joya Demon 02','Pieza artesanal de edición limitada.','Colección',499,8,'',true,true,now],
      ['DJ-003','Joya Demon 03','Diseño elegante para regalo.','Colección',449,6,'',true,false,now],
      ['DJ-004','Joya Demon 04','Pieza brillante con acabado premium.','Colección',549,5,'',true,false,now]
    ]);
  }

  return {
    ok: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    message: 'Configuración terminada.'
  };
}

function configureStore(settings) {
  settings = settings || {};
  const props = PropertiesService.getScriptProperties();
  if (settings.spreadsheetId) props.setProperty(APP.SHEET_ID_PROPERTY, String(settings.spreadsheetId).trim());
  if (settings.adminEmail) props.setProperty(APP.ADMIN_EMAIL_PROPERTY, String(settings.adminEmail).trim());
  if (settings.whatsapp) props.setProperty(APP.WHATSAPP_PROPERTY, String(settings.whatsapp).replace(/\D/g,''));
  return {ok:true};
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,headers.length).setFontWeight('bold');
  return sh;
}
