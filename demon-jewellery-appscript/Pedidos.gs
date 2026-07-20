function crearPedido(payload) {
  validateOrder_(payload);
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName('Pedidos');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const catalog = Object.fromEntries(obtenerCatalogo().map(p => [p.id,p]));
    let subtotal = 0;
    const items = payload.items.map(item => {
      const p = catalog[item.id];
      if (!p) throw new Error('Producto no disponible: ' + item.id);
      const qty = Math.max(1, Math.floor(Number(item.cantidad || 1)));
      if (qty > p.existencia) throw new Error('Existencia insuficiente para ' + p.nombre);
      subtotal += p.precio * qty;
      return {id:p.id,nombre:p.nombre,precio:p.precio,cantidad:qty,total:p.precio*qty};
    });

    const shipping = subtotal >= 1000 ? 0 : 99;
    const total = subtotal + shipping;
    const orderId = 'DJ-' + Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random()*900+100);
    const now = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    sh.appendRow([
      orderId, now, clean_(payload.nombre), clean_(payload.telefono), clean_(payload.email),
      clean_(payload.direccion), JSON.stringify(items), subtotal, shipping, total,
      'NUEVO', clean_(payload.notas)
    ]);

    sendOrderEmail_(orderId, payload, items, subtotal, shipping, total);
    return {ok:true,pedidoId:orderId,subtotal,envio:shipping,total};
  } finally {
    lock.releaseLock();
  }
}

function validateOrder_(p) {
  if (!p || !Array.isArray(p.items) || !p.items.length) throw new Error('El carrito está vacío.');
  if (!String(p.nombre || '').trim()) throw new Error('Escribe tu nombre.');
  if (!String(p.telefono || '').replace(/\D/g,'').match(/^\d{10,15}$/)) throw new Error('Escribe un teléfono válido.');
  if (!String(p.direccion || '').trim()) throw new Error('Escribe la dirección de entrega.');
}

function clean_(value) {
  return String(value || '').trim().slice(0,1000);
}

function sendOrderEmail_(id, p, items, subtotal, shipping, total) {
  const admin = PropertiesService.getScriptProperties().getProperty(APP.ADMIN_EMAIL_PROPERTY);
  if (!admin) return;
  const rows = items.map(i => `${i.cantidad} x ${i.nombre} — $${i.total.toFixed(2)}`).join('\n');
  const body = `Nuevo pedido ${id}\n\nCliente: ${p.nombre}\nTeléfono: ${p.telefono}\nEmail: ${p.email || '-'}\nDirección: ${p.direccion}\n\n${rows}\n\nSubtotal: $${subtotal.toFixed(2)}\nEnvío: $${shipping.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nNotas: ${p.notas || '-'}`;
  MailApp.sendEmail({to:admin,subject:`Nuevo pedido ${id} - ${APP.NAME}`,body});
}
