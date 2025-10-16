export interface Articulo {
    codigo: string;
    descripcion: string;
    precio: number;
    costo: number;
    categoria?: string;
    unidadMedida: string;
    activo: boolean;
    fechaRegistro: Date;
}

export interface CreateArticuloDTO {
    codigo: string;
    descripcion: string;
    precio: number;
    costo?: number;
    categoria?: string;
    unidadMedida?: string;
}

export interface UpdateArticuloDTO {
    descripcion?: string;
    precio?: number;
    costo?: number;
    categoria?: string;
    unidadMedida?: string;
    activo?: boolean;
}

export interface ArticuloConInventario extends Articulo {
    cantidad?: number;
    stockMinimo?: number;
    stockMaximo?: number;
    estadoStock?: 'BAJO' | 'OK' | 'EXCESO';
}
