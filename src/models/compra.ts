export interface Compra {
    folioCompra: number;
    fecha: Date;
    proveedorId: number;
    usuarioId: number;
    subtotal: number;
    iva: number;
    total: number;
    estado: 'pendiente' | 'recibida' | 'cancelada';
    fechaRecepcion?: Date;
    notas?: string;
}

export interface CreateCompraDTO {
    proveedorId: number;
    usuarioId: number;
    iva?: number;
    notas?: string;
}

export interface UpdateCompraDTO {
    estado?: 'pendiente' | 'recibida' | 'cancelada';
    iva?: number;
    notas?: string;
}

export interface CompraConDetalles extends Compra {
    detalles: DetalleCompra[];
    nombreProveedor?: string;
    nombreUsuario?: string;
}

export interface DetalleCompra {
    folioDetalle: number;
    folioCompra: number;
    codigoArticulo: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
}

export interface CreateDetalleCompraDTO {
    folioCompra: number;
    codigoArticulo: string;
    cantidad: number;
    costoUnitario: number;
}

export interface UpdateDetalleCompraDTO {
    cantidad?: number;
    costoUnitario?: number;
}
