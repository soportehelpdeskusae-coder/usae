function obtenerCatalogo() {
  const sh = getSpreadsheet_().getSheetByName(APP.SHEETS.PRODUCTS);
  if (!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data.shift().map(h => String(h).trim());
  return data
    .map(row => Object.fromEntries(headers.map((h,i) => [h,row[i]])))
    .filter(p => String(p.id || '').trim() && truthy_(p.activo))
    .map(p => ({
      id: String(p.id || '').trim(),
      nombre: String(p.nombre || '').trim(),
      descripcion: String(p.descripcion || '').trim(),
      categoria: String(p.categoria || '').trim(),
      precio: Number(p.precio || 0),
      existencia: Math.max(0, Number(p.existencia || 0)),
      imagenUrl: String(p.imagenUrl || '').trim(),
      destacado: truthy_(p.destacado)
    }))
    .sort((a,b) => Number(b.destacado) - Number(a.destacado) || a.nombre.localeCompare(b.nombre, 'es'));
}
function truthy_(value) {
  const v = String(value).trim().toLowerCase();
  return value === true || ['true','1','sí','si','activo','yes'].includes(v);
}
