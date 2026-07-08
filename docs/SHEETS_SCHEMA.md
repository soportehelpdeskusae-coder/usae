# Esquema de Google Sheets

## Catalogo

| Campo | Uso |
|---|---|
| productId | ID único del producto. |
| nombre | Nombre visible. |
| categoria | Anillos, Collares, Pulseras, Personalizados, etc. |
| descripcion | Descripción comercial. |
| material | Material principal. |
| precioMXN | Precio numérico en MXN. Si es 0 muestra “A cotizar”. |
| stock | Existencias. |
| imagen | URL completa o ruta relativa como `img/producto_01.jpg`. |
| tags | Palabras clave separadas por coma. |
| activo | Usa `SI` para mostrar. |
| destacado | Usa `SI` para destacar. |
| updatedAt | Fecha de última actualización. |

## Pedidos

Guarda folio, cliente, contacto, producto, total, referencia de pago, estatus y fecha.

## Disenos

Guarda solicitudes de piezas personalizadas, presupuesto, material, talla, descripción, imagen de referencia y estatus.

## Clientes

Relación básica de clientes por nombre, WhatsApp, correo y dirección.

## Auditoria

Registro de acciones importantes del sistema.

## Configuracion

Llaves de configuración opcionales.
