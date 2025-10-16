export interface Proveedor {
    proveedorId: number;
    nombreEmpresa: string;
    rfc?: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    activo: boolean;
    fechaRegistro: Date;
}

export interface CreateProveedorDTO {
    nombreEmpresa: string;
    rfc?: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

export interface UpdateProveedorDTO {
    nombreEmpresa?: string;
    rfc?: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    activo?: boolean;
}
