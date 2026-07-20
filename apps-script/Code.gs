const APP = Object.freeze({
  SPREADSHEET_ID: '15Kd9BGsL6itd05hYyy4yQePSCn0ir5X0wtiWswNuGjI',
  SHEETS: Object.freeze({
    PRODUCTS: 'Productos',
    ORDERS: 'Pedidos',
    CUSTOMERS: 'Clientes',
    CONFIG: 'Configuracion'
  }),
  TIMEZONE: 'America/Mexico_City',
  CACHE_SECONDS: 60
});

function doGet() {
  try {
    const url = 'https://raw.githubusercontent.com/soportehelpdeskusae-coder/usae/main/index.html';
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { Accept: 'text/html,text/plain' }
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('No fue posible descargar el frontend desde GitHub.');
    }

    return HtmlService.createHtmlOutput(response.getContentText('UTF-8'))
      .setTitle('Joyería Artesanal USAE')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error(error);
    return HtmlService.createHtmlOutput(
      '<h1>No fue posible cargar la tienda</h1><p>Intenta nuevamente más tarde.</p>'
    );
  }
}

function healthCheck() {
  try {
    const ss = getSpreadsheet_();
    return {
      ok: true,
      message: 'Conexión establecida',
      spreadsheetName: ss.getName(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(error);
    return { ok: false, message: normalizeError_(error) };
  }
}

function getInitialData() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('initialData');
    if (cached) return JSON.parse(cached);

    const config = getConfig_();
    const products = getProducts_();
    const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es'));

    const response = {
      ok: true,
      config,
      products,
      categories,
      serverTime: new Date().toISOString()
    };

    cache.put('initialData', JSON.stringify(response), APP.CACHE_SECONDS);
    return response;
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: normalizeError_(error),
      config: {},
      products: [],
      categories: []
    };
  }
}

function getProducts() {
  try {
    return { ok: true, products: getProducts_() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: normalizeError_(error), products: [] };
  }
}

function createOrder(payload) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);

    const order = sanitizeOrder_(payload);
    const ss = getSpreadsheet_();
    const productsSheet = getRequiredSheet_(ss, APP.SHEETS.PRODUCTS);
    const ordersSheet = getRequiredSheet_(ss, APP.SHEETS.ORDERS);
    const customersSheet = getRequiredSheet_(ss, APP.SHEETS.CUSTOMERS);

    const productTable = readTable_(productsSheet);
    const productIndexById = new Map();

    productTable.rows.forEach((row, index) => {
      productIndexById.set(String(row.id || '').trim(), { row, sheetRow: index + 2 });
    });

    const validatedItems = [];
    let subtotal = 0;

    order.items.forEach(item => {
      const found = productIndexById.get(item.id);
      if (!found) throw new Error(`El producto ${item.id} ya no existe.`);

      const product = found.row;
      const active = toBoolean_(product.activo);
      const stock = toNumber_(product.stock);
      const price = toNumber_(product.precio);

      if (!active) throw new Error(`${product.nombre} ya no está disponible.`);
      if (item.quantity < 1 || item.quantity > stock) {
        throw new Error(`Stock insuficiente para ${product.nombre}. Disponible: ${stock}.`);
      }

      const lineTotal = roundCurrency_(price * item.quantity);
      subtotal += lineTotal;
      validatedItems.push({
        id: item.id,
        nombre: product.nombre,
        precio: price,
        cantidad: item.quantity,
        total: lineTotal,
        sheetRow: found.sheetRow,
        stockBefore: stock
      });
    });

    subtotal = roundCurrency_(subtotal);
    const config = getConfig_();
    const freeShippingFrom = toNumber_(config.envioGratisDesde);
    const standardShipping = toNumber_(config.costoEnvio);
    const shipping = subtotal >= freeShippingFrom ? 0 : standardShipping;
    const total = roundCurrency_(subtotal + shipping);

    const orderId = generateId_('PED');
    const now = new Date();
    const productsJson = JSON.stringify(validatedItems.map(item => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      total: item.total
    })));

    appendObjectRow_(ordersSheet, {
      pedidoId: orderId,
      fecha: now,
      cliente: order.customer.name,
      telefono: order.customer.phone,
      email: order.customer.email,
      direccion: order.customer.address,
      ciudad: order.customer.city,
      estado: order.customer.state,
      codigoPostal: order.customer.postalCode,
      metodoPago: order.paymentMethod,
      subtotal,
      envio: shipping,
      total,
      estatus: 'Nuevo',
      productos: productsJson,
      notas: order.notes
    });

    upsertCustomer_(customersSheet, order.customer, orderId, now);
    const stockColumn = getHeaderColumn_(productTable.headers, 'stock');

    validatedItems.forEach(item => {
      productsSheet.getRange(item.sheetRow, stockColumn)
        .setValue(item.stockBefore - item.cantidad);
    });

    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove('initialData');

    return {
      ok: true,
      orderId,
      subtotal,
      shipping,
      total,
      message: 'Pedido registrado correctamente'
    };
  } catch (error) {
    console.error(error);
    return { ok: false, message: normalizeError_(error) };
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function setup() {
  const ss = getSpreadsheet_();

  ensureSheet_(ss, APP.SHEETS.PRODUCTS, [
    'id', 'nombre', 'categoria', 'descripcion', 'precio', 'precioAnterior',
    'stock', 'imagen', 'destacado', 'nuevo', 'activo', 'material', 'piedra',
    'peso', 'fechaActualizacion'
  ]);

  ensureSheet_(ss, APP.SHEETS.ORDERS, [
    'pedidoId', 'fecha', 'cliente', 'telefono', 'email', 'direccion',
    'ciudad', 'estado', 'codigoPostal', 'metodoPago', 'subtotal', 'envio',
    'total', 'estatus', 'productos', 'notas'
  ]);

  ensureSheet_(ss, APP.SHEETS.CUSTOMERS, [
    'clienteId', 'fechaRegistro', 'nombre', 'telefono', 'email', 'direccion',
    'ciudad', 'estado', 'codigoPostal', 'ultimoPedido'
  ]);

  ensureSheet_(ss, APP.SHEETS.CONFIG, ['clave', 'valor']);
  CacheService.getScriptCache().remove('initialData');

  return {
    ok: true,
    message: 'Estructura verificada correctamente',
    spreadsheetUrl: ss.getUrl()
  };
}

function getProducts_() {
  const sheet = getRequiredSheet_(getSpreadsheet_(), APP.SHEETS.PRODUCTS);
  const table = readTable_(sheet);

  return table.rows
    .filter(row => toBoolean_(row.activo))
    .map(row => ({
      id: String(row.id || '').trim(),
      nombre: String(row.nombre || '').trim(),
      categoria: String(row.categoria || 'Sin categoría').trim(),
      descripcion: String(row.descripcion || '').trim(),
      precio: toNumber_(row.precio),
      precioAnterior: toNumber_(row.precioAnterior),
      stock: Math.max(0, Math.floor(toNumber_(row.stock))),
      imagen: String(row.imagen || '').trim(),
      destacado: toBoolean_(row.destacado),
      nuevo: toBoolean_(row.nuevo),
      activo: true,
      material: String(row.material || '').trim(),
      piedra: String(row.piedra || '').trim(),
      peso: String(row.peso || '').trim(),
      fechaActualizacion: serializeValue_(row.fechaActualizacion)
    }))
    .filter(product => product.id && product.nombre);
}

function getConfig_() {
  const sheet = getRequiredSheet_(getSpreadsheet_(), APP.SHEETS.CONFIG);
  const values = sheet.getDataRange().getValues();
  const config = {
    nombreTienda: 'Joyería Artesanal',
    slogan: 'Joyas únicas para momentos inolvidables',
    whatsapp: '',
    email: '',
    moneda: 'MXN',
    envioGratisDesde: 1500,
    costoEnvio: 149,
    mensajePortada: 'Colección hecha para brillar contigo'
  };

  values.slice(1).forEach(row => {
    const key = String(row[0] || '').trim();
    if (key) config[key] = serializeValue_(row[1]);
  });

  config.envioGratisDesde = toNumber_(config.envioGratisDesde);
  config.costoEnvio = toNumber_(config.costoEnvio);
  return config;
}

function sanitizeOrder_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Los datos del pedido no son válidos.');
  }

  const customer = payload.customer || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const clean = {
    customer: {
      name: cleanText_(customer.name, 120),
      phone: cleanText_(customer.phone, 30),
      email: cleanText_(customer.email, 160).toLowerCase(),
      address: cleanText_(customer.address, 220),
      city: cleanText_(customer.city, 100),
      state: cleanText_(customer.state, 100),
      postalCode: cleanText_(customer.postalCode, 12)
    },
    paymentMethod: cleanText_(payload.paymentMethod || 'Transferencia', 60),
    notes: cleanText_(payload.notes || '', 500),
    items: items.map(item => ({
      id: cleanText_(item.id, 80),
      quantity: Math.floor(toNumber_(item.quantity))
    }))
  };

  if (!clean.customer.name) throw new Error('Escribe el nombre del cliente.');
  if (!clean.customer.phone) throw new Error('Escribe un teléfono.');
  if (!clean.customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.customer.email)) {
    throw new Error('Escribe un correo electrónico válido.');
  }
  if (!clean.customer.address) throw new Error('Escribe la dirección de entrega.');
  if (!clean.customer.city) throw new Error('Escribe la ciudad.');
  if (!clean.customer.state) throw new Error('Escribe el estado.');
  if (!/^\d{5}$/.test(clean.customer.postalCode)) {
    throw new Error('El código postal debe contener 5 dígitos.');
  }
  if (!clean.items.length) throw new Error('El carrito está vacío.');

  const grouped = new Map();
  clean.items.forEach(item => {
    if (!item.id || item.quantity < 1) {
      throw new Error('Hay un producto inválido en el carrito.');
    }
    grouped.set(item.id, (grouped.get(item.id) || 0) + item.quantity);
  });

  clean.items = [...grouped.entries()].map(([id, quantity]) => ({ id, quantity }));
  return clean;
}

function upsertCustomer_(sheet, customer, orderId, now) {
  const table = readTable_(sheet);
  const email = customer.email.toLowerCase();
  const emailColumn = table.headers.indexOf('email');
  let existingRow = -1;

  table.rawRows.forEach((row, index) => {
    if (String(row[emailColumn] || '').trim().toLowerCase() === email) {
      existingRow = index + 2;
    }
  });

  const record = {
    clienteId: existingRow > 0
      ? sheet.getRange(existingRow, getHeaderColumn_(table.headers, 'clienteId')).getValue()
      : generateId_('CLI'),
    fechaRegistro: existingRow > 0
      ? sheet.getRange(existingRow, getHeaderColumn_(table.headers, 'fechaRegistro')).getValue()
      : now,
    nombre: customer.name,
    telefono: customer.phone,
    email: customer.email,
    direccion: customer.address,
    ciudad: customer.city,
    estado: customer.state,
    codigoPostal: customer.postalCode,
    ultimoPedido: orderId
  };

  if (existingRow > 0) {
    const rowValues = table.headers.map(header => record[header] ?? '');
    sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    appendObjectRow_(sheet, record);
  }
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(APP.SPREADSHEET_ID);
}

function getRequiredSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`No existe la pestaña "${name}" en la hoja de cálculo.`);
  return sheet;
}

function readTable_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { headers: [], rows: [], rawRows: [] };

  const headers = values[0].map(value => String(value || '').trim());
  const rawRows = values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null));

  const rows = rawRows.map(row => {
    const object = {};
    headers.forEach((header, index) => {
      if (header) object[header] = row[index];
    });
    return object;
  });

  return { headers, rows, rawRows };
}

function appendObjectRow_(sheet, object) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) {
    throw new Error(`La pestaña "${sheet.getName()}" no tiene encabezados.`);
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map(value => String(value || '').trim());
  sheet.appendRow(headers.map(header => object[header] ?? ''));
}

function getHeaderColumn_(headers, headerName) {
  const index = headers.indexOf(headerName);
  if (index < 0) throw new Error(`Falta la columna "${headerName}".`);
  return index + 1;
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const currentHeaders = sheet
      .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length))
      .getValues()[0]
      .map(value => String(value || '').trim());

    headers.forEach(header => {
      if (!currentHeaders.includes(header)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
  }

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, Math.min(headers.length, 15));
  return sheet;
}

function generateId_(prefix) {
  const timestamp = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyyMMdd-HHmmss');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

function cleanText_(value, maxLength) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function toBoolean_(value) {
  if (value === true) return true;
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['true', 'verdadero', 'sí', 'si', '1', 'activo'].includes(normalized);
}

function toNumber_(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/[$,]/g, '')
    .replace(/[^\d.-]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function roundCurrency_(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function serializeValue_(value) {
  if (value instanceof Date) return value.toISOString();
  return value ?? '';
}

function normalizeError_(error) {
  if (!error) return 'Ocurrió un error desconocido.';
  return String(error.message || error).replace(/^Exception:\s*/i, '');
}
