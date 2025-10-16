import { z } from 'zod';

export const createVentaSchema = z.object({
    clienteId: z.number().positive('El ID del cliente es requerido'),
    usuarioId: z.number().positive('El ID del usuario es requerido'),
    aplicarDescuentoPuntos: z.boolean().default(false).optional(),
    notas: z.string().optional(),
});

export const updateVentaSchema = z.object({
    estado: z.enum(['completada', 'cancelada']).optional(),
    notas: z.string().optional(),
});

export const createDetalleVentaSchema = z.object({
    folioVenta: z.number().positive('El folio de la venta es requerido'),
    codigoArticulo: z.string().min(1, 'El código del artículo es requerido').max(50),
    cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
    precioUnitario: z.number().positive('El precio unitario debe ser mayor a 0'),
    descuentoUnitario: z.number().nonnegative().default(0).optional(),
});

export const updateDetalleVentaSchema = z.object({
    cantidad: z.number().positive().optional(),
    precioUnitario: z.number().positive().optional(),
    descuentoUnitario: z.number().nonnegative().optional(),
});

// Schema para crear venta completa con sus detalles
export const createVentaCompletaSchema = z.object({
    clienteId: z.number().positive('El ID del cliente es requerido'),
    usuarioId: z.number().positive('El ID del usuario es requerido'),
    aplicarDescuentoPuntos: z.boolean().default(false).optional(),
    notas: z.string().optional(),
    detalles: z.array(z.object({
        codigoArticulo: z.string().min(1).max(50),
        cantidad: z.number().positive(),
        precioUnitario: z.number().positive(),
        descuentoUnitario: z.number().nonnegative().default(0).optional(),
    })).min(1, 'Debe incluir al menos un detalle'),
});

export type CreateVentaInput = z.infer<typeof createVentaSchema>;
export type UpdateVentaInput = z.infer<typeof updateVentaSchema>;
export type CreateDetalleVentaInput = z.infer<typeof createDetalleVentaSchema>;
export type UpdateDetalleVentaInput = z.infer<typeof updateDetalleVentaSchema>;
export type CreateVentaCompletaInput = z.infer<typeof createVentaCompletaSchema>;
