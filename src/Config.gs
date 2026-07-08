/**
 * Demon Jewellery — Configuración general
 * Mantén aquí los datos públicos de la tienda.
 */
const DJ_CONFIG = {
  APP_NAME: 'Demon Jewellery',
  TAGLINE: 'Brillante Estilo',
  VERSION: '1.0.0',
  TIMEZONE: 'America/Mexico_City',
  CURRENCY: 'MXN',
  DEFAULT_BRANCH: 'main',
  CONTACT: {
    whatsapp: '5215500000000',
    email: 'ventas@demonjewellery.com',
    instagram: '@demonjewellery',
    facebook: 'Demon Jewellery'
  },
  PROPS: {
    spreadsheetId: 'DJ_SPREADSHEET_ID',
    adminPin: 'DJ_ADMIN_PIN',
    githubRepo: 'DJ_GITHUB_REPO',
    githubRef: 'DJ_GITHUB_REF',
    githubToken: 'DJ_GITHUB_TOKEN',
    useRemoteHtml: 'DJ_USE_REMOTE_HTML',
    publicAssetsBaseUrl: 'DJ_PUBLIC_ASSETS_BASE_URL'
  },
  SHEETS: {
    catalogo: 'Catalogo',
    pedidos: 'Pedidos',
    disenos: 'Disenos',
    clientes: 'Clientes',
    auditoria: 'Auditoria',
    configuracion: 'Configuracion'
  },
  HEADERS: {
    Catalogo: [
      'productId', 'nombre', 'categoria', 'descripcion', 'material', 'precioMXN',
      'stock', 'imagen', 'tags', 'activo', 'destacado', 'updatedAt'
    ],
    Pedidos: [
      'orderId', 'createdAt', 'status', 'customerName', 'phone', 'email',
      'deliveryMode', 'address', 'productId', 'productName', 'qty', 'unitPriceMXN',
      'totalMXN', 'notes', 'paymentStatus', 'paymentReference', 'updatedAt'
    ],
    Disenos: [
      'designId', 'createdAt', 'status', 'customerName', 'phone', 'email',
      'tipoPieza', 'material', 'presupuestoMXN', 'talla', 'descripcion',
      'imagenReferencia', 'dueDate', 'notes', 'updatedAt'
    ],
    Clientes: [
      'customerId', 'createdAt', 'updatedAt', 'name', 'phone', 'email', 'address', 'notes'
    ],
    Auditoria: [
      'id', 'createdAt', 'actor', 'action', 'entity', 'entityId', 'detail'
    ],
    Configuracion: [
      'key', 'value', 'updatedAt'
    ]
  },
  STATUSES: {
    order: ['NUEVO', 'CONFIRMADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'],
    design: ['NUEVO', 'EN_REVISION', 'COTIZADO', 'APROBADO', 'EN_PRODUCCION', 'ENTREGADO', 'CANCELADO'],
    payment: ['PENDIENTE', 'VALIDANDO', 'PAGADO', 'RECHAZADO']
  },
  DEFAULT_ASSETS: {
    logo: 'img/logo_demon_jewellery.png',
    hero: 'img/producto_01.jpg',
    producto1: 'img/producto_01.jpg',
    producto2: 'img/producto_02.jpg',
    producto3: 'img/producto_03.jpg',
    producto4: 'img/producto_04.jpg'
  }
};

function web_getClientConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    appName: DJ_CONFIG.APP_NAME,
    tagline: DJ_CONFIG.TAGLINE,
    version: DJ_CONFIG.VERSION,
    currency: DJ_CONFIG.CURRENCY,
    contact: DJ_CONFIG.CONTACT,
    whatsappUrl: buildWhatsappUrl_('Hola, quiero información de Demon Jewellery.'),
    assetBaseUrl: remote_getAssetBaseUrl_(),
    defaultAssets: (typeof asset_getDefaultAssets_ === 'function') ? asset_getDefaultAssets_() : DJ_CONFIG.DEFAULT_ASSETS,
    remoteHtml: props.getProperty(DJ_CONFIG.PROPS.useRemoteHtml) === 'true',
    categories: obtenerCategorias()
  };
}

function buildWhatsappUrl_(message) {
  const phone = String(DJ_CONFIG.CONTACT.whatsapp || '').replace(/\D/g, '');
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message || 'Hola');
}

function now_() {
  return Utilities.formatDate(new Date(), DJ_CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
}

function money_(value) {
  const n = Number(value || 0);
  return Math.round(n * 100) / 100;
}

function toBool_(value) {
  return String(value || '').trim().toUpperCase() === 'SI' || value === true || String(value).toLowerCase() === 'true';
}

function clean_(value) {
  return String(value == null ? '' : value).trim();
}

function normalizePhone_(phone) {
  return String(phone || '').replace(/[^0-9+]/g, '').trim();
}

function generateId_(prefix) {
  const stamp = Utilities.formatDate(new Date(), DJ_CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return prefix + '-' + stamp + '-' + rnd;
}

function jsonOk_(data) {
  return { ok: true, data: data || null };
}

function jsonFail_(message, detail) {
  return { ok: false, message: message || 'Ocurrió un error.', detail: detail || null };
}
