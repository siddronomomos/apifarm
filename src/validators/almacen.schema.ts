import { z } from 'zod';

export const createAlmacenSchema = z.object({
    codigoArticulo: z.string().min(1, 'El código del artículo es requerido').max(50),
    cantidad: z.number().nonnegative('La cantidad debe ser mayor o igual a 0'),
    stockMinimo: z.number().nonnegative().default(10).optional(),
    stockMaximo: z.number().nonnegative().default(1000).optional(),
    ubicacion: z.string().max(50).optional(),
}).refine(data => !data.stockMaximo || !data.stockMinimo || data.stockMaximo >= data.stockMinimo, {
    message: 'El stock máximo debe ser mayor o igual al stock mínimo',
    path: ['stockMaximo'],
});

export const updateAlmacenSchema = z.object({
    cantidad: z.number().nonnegative().optional(),
    stockMinimo: z.number().nonnegative().optional(),
    stockMaximo: z.number().nonnegative().optional(),
    ubicacion: z.string().max(50).optional(),
}).refine(data => {
    if (data.stockMaximo !== undefined && data.stockMinimo !== undefined) {
        return data.stockMaximo >= data.stockMinimo;
    }
    return true;
}, {
    message: 'El stock máximo debe ser mayor o igual al stock mínimo',
    path: ['stockMaximo'],
});

export const ajusteInventarioSchema = z.object({
    codigoArticulo: z.string().min(1).max(50),
    cantidad: z.number().refine(val => val !== 0, 'El ajuste no puede ser 0'),
    motivo: z.string().min(1, 'El motivo es requerido'),
});

export type CreateAlmacenInput = z.infer<typeof createAlmacenSchema>;
export type UpdateAlmacenInput = z.infer<typeof updateAlmacenSchema>;
export type AjusteInventarioInput = z.infer<typeof ajusteInventarioSchema>;
