import { z } from 'zod';

export const createCompraSchema = z.object({
    proveedorId: z.number().positive('El ID del proveedor es requerido'),
    usuarioId: z.number().positive('El ID del usuario es requerido'),
    iva: z.number().nonnegative().default(0).optional(),
    notas: z.string().optional(),
});

export const updateCompraSchema = z.object({
    estado: z.enum(['pendiente', 'recibida', 'cancelada']).optional(),
    iva: z.number().nonnegative().optional(),
    notas: z.string().optional(),
});

export const createDetalleCompraSchema = z.object({
    folioCompra: z.number().positive('El folio de la compra es requerido'),
    codigoArticulo: z.string().min(1, 'El código del artículo es requerido').max(50),
    cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
    costoUnitario: z.number().positive('El costo unitario debe ser mayor a 0'),
});

export const updateDetalleCompraSchema = z.object({
    cantidad: z.number().positive().optional(),
    costoUnitario: z.number().positive().optional(),
});

// Schema para crear compra completa con sus detalles
export const createCompraCompletaSchema = z.object({
    proveedorId: z.number().positive('El ID del proveedor es requerido'),
    usuarioId: z.number().positive('El ID del usuario es requerido'),
    iva: z.number().nonnegative().default(0).optional(),
    notas: z.string().optional(),
    detalles: z.array(z.object({
        codigoArticulo: z.string().min(1).max(50),
        cantidad: z.number().positive(),
        costoUnitario: z.number().positive(),
    })).min(1, 'Debe incluir al menos un detalle'),
});

export type CreateCompraInput = z.infer<typeof createCompraSchema>;
export type UpdateCompraInput = z.infer<typeof updateCompraSchema>;
export type CreateDetalleCompraInput = z.infer<typeof createDetalleCompraSchema>;
export type UpdateDetalleCompraInput = z.infer<typeof updateDetalleCompraSchema>;
export type CreateCompraCompletaInput = z.infer<typeof createCompraCompletaSchema>;
