export interface Articulo {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    costo: number;
    categoria?: string;
    unidadMedida: string;
    activo: boolean;
    fechaRegistro: Date;
}

export interface CreateArticuloDTO {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    costo?: number;
    categoria?: string;
    unidadMedida?: string;
}

export interface UpdateArticuloDTO {
    nombre?: string;
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
