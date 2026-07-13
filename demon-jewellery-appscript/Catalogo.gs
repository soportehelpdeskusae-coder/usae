function obtenerCatalogo() {
  const sh = getSpreadsheet_().getSheetByName('Catalogo');
  if (!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data.shift().map(String);
  return data.map(row => Object.fromEntries(headers.map((h,i) => [h,row[i]])))
    .filter(p => truthy_(p.activo))
    .map(p => ({
      id: String(p.id || ''),
      nombre: String(p.nombre || ''),
      descripcion: String(p.descripcion || ''),
      categoria: String(p.categoria || ''),
      precio: Number(p.precio || 0),
      existencia: Number(p.existencia || 0),
      imagenUrl: String(p.imagenUrl || ''),
      destacado: truthy_(p.destacado)
    }));
}

function truthy_(value) {
  return value === true || String(value).toLowerCase() === 'true' || String(value) === '1' || String(value).toLowerCase() === 'sí';
}
