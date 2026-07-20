function doGet() {
  const tpl = HtmlService.createTemplateFromFile('Index');
  tpl.config = getPublicConfig_();
  return tpl.evaluate()
    .setTitle(tpl.config.appName + ' | ' + tpl.config.tagline)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function setup() {
  const ss = getSpreadsheet_();
  ensureSheet_(ss, APP.SHEETS.PRODUCTS, ['id','nombre','descripcion','categoria','precio','existencia','imagenUrl','activo','destacado','actualizado']);
  ensureSheet_(ss, APP.SHEETS.ORDERS, ['pedidoId','fecha','nombre','telefono','email','direccion','productosJson','subtotal','envio','total','estatus','metodoPago','notas']);
  ensureSheet_(ss, APP.SHEETS.CLIENTS, ['clienteId','nombre','telefono','email','direccion','primerPedido','ultimoPedido','totalPedidos','totalGastado','notas']);
  const config = ensureSheet_(ss, APP.SHEETS.CONFIG, ['clave','valor']);
  if (config.getLastRow() === 1) config.getRange(2,1,6,2).setValues([['nombreTienda',APP.NAME],['eslogan',APP.TAGLINE],['whatsapp',''],['costoEnvio',APP.SHIPPING_COST],['envioGratisDesde',APP.FREE_SHIPPING_FROM],['moneda',APP.CURRENCY]]);
  return {ok:true,spreadsheetId:ss.getId(),spreadsheetUrl:ss.getUrl(),message:'Tienda configurada correctamente.'};
}
function configureStore(settings) {
  settings=settings||{};
  const props=PropertiesService.getScriptProperties();
  if(settings.adminEmail) props.setProperty(APP.ADMIN_EMAIL_PROPERTY,String(settings.adminEmail).trim());
  if(settings.whatsapp) props.setProperty(APP.WHATSAPP_PROPERTY,String(settings.whatsapp).replace(/\D/g,''));
  return {ok:true};
}
function ensureSheet_(ss,name,headers){let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);const current=sh.getRange(1,1,1,Math.max(headers.length,sh.getLastColumn())).getDisplayValues()[0];headers.forEach((header,i)=>{if(!current[i])sh.getRange(1,i+1).setValue(header);});sh.setFrozenRows(1);sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#111111').setFontColor('#d8b65a');return sh;}
