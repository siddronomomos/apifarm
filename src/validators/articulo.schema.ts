import { z } from 'zod';

export const createArticuloSchema = z.object({
    codigo: z.string().min(1, 'El código es requerido').max(50),
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    descripcion: z.string().max(255).optional(),
    precio: z.number().positive('El precio debe ser positivo'),
    costo: z.number().nonnegative('El costo debe ser mayor o igual a 0').optional(),
    categoria: z.string().max(100).optional(),
    unidadMedida: z.string().max(20).default('PZA').optional(),
});

export const updateArticuloSchema = z.object({
    nombre: z.string().min(1).max(100).optional(),
    descripcion: z.string().max(255).optional(),
    precio: z.number().positive().optional(),
    costo: z.number().nonnegative().optional(),
    categoria: z.string().max(100).optional(),
    unidadMedida: z.string().max(20).optional(),
    activo: z.boolean().optional(),
});

export type CreateArticuloInput = z.infer<typeof createArticuloSchema>;
export type UpdateArticuloInput = z.infer<typeof updateArticuloSchema>;
