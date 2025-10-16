export interface Venta {
    folio: number;
    fecha: Date;
    clienteId: number;
    usuarioId: number;
    subtotal: number;
    descuento: number;
    total: number;
    puntosUsados: number;
    puntosGenerados: number;
    estado: 'completada' | 'cancelada';
    notas?: string;
}

export interface CreateVentaDTO {
    clienteId: number;
    usuarioId: number;
    aplicarDescuentoPuntos?: boolean;
    notas?: string;
}

export interface UpdateVentaDTO {
    estado?: 'completada' | 'cancelada';
    notas?: string;
}

export interface VentaConDetalles extends Venta {
    detalles: DetalleVenta[];
    nombreCliente?: string;
    nombreUsuario?: string;
}

export interface DetalleVenta {
    folioDetalle: number;
    folioVenta: number;
    codigoArticulo: string;
    cantidad: number;
    precioUnitario: number;
    descuentoUnitario: number;
    subtotal: number;
    total: number;
}

export interface CreateDetalleVentaDTO {
    folioVenta: number;
    codigoArticulo: string;
    cantidad: number;
    precioUnitario: number;
    descuentoUnitario?: number;
}

export interface UpdateDetalleVentaDTO {
    cantidad?: number;
    precioUnitario?: number;
    descuentoUnitario?: number;
}
