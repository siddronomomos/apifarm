export interface Almacen {
    almacenId: number;
    codigoArticulo: string;
    cantidad: number;
    stockMinimo: number;
    stockMaximo: number;
    ubicacion?: string;
    ultimaActualizacion: Date;
}

export interface CreateAlmacenDTO {
    codigoArticulo: string;
    cantidad: number;
    stockMinimo?: number;
    stockMaximo?: number;
    ubicacion?: string;
}

export interface UpdateAlmacenDTO {
    cantidad?: number;
    stockMinimo?: number;
    stockMaximo?: number;
    ubicacion?: string;
}

export interface AlertaInventario {
    codigo: string;
    descripcion: string;
    cantidad: number;
    stockMinimo: number;
    estadoStock: 'BAJO' | 'OK' | 'EXCESO';
}
