export interface Cliente {
    clienteId: number;
    usuarioId: number;
    nombreCompleto: string;
    rfc?: string;
    direccion?: string;
    telefono?: string;
    puntosAcumulados: number;
    totalGastado: number;
    activo: boolean;
    fechaRegistro: Date;
}

export interface NewCliente {
    usuarioId: number;
    nombreCompleto: string;
    rfc?: string;
    direccion?: string;
    telefono?: string;
}

export interface UpdateCliente {
    nombreCompleto?: string;
    rfc?: string;
    direccion?: string;
    telefono?: string;
    activo?: boolean;
}

export interface ClienteConDescuento extends Cliente {
    descuentoDisponible: boolean;
    descuentosDisponibles: number;
}
