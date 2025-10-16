import { z } from 'zod';

export const createProveedorSchema = z.object({
    nombreEmpresa: z.string().min(1, 'El nombre de la empresa es requerido').max(200),
    rfc: z.string().length(13, 'El RFC debe tener 13 caracteres').optional().or(z.literal('')),
    contacto: z.string().max(100).optional(),
    telefono: z.string().max(20).optional(),
    email: z.string().email('Email inválido').max(100).optional().or(z.literal('')),
    direccion: z.string().optional(),
});

export const updateProveedorSchema = z.object({
    nombreEmpresa: z.string().min(1).max(200).optional(),
    rfc: z.string().length(13).optional().or(z.literal('')),
    contacto: z.string().max(100).optional(),
    telefono: z.string().max(20).optional(),
    email: z.string().email().max(100).optional().or(z.literal('')),
    direccion: z.string().optional(),
    activo: z.boolean().optional(),
});

export type CreateProveedorInput = z.infer<typeof createProveedorSchema>;
export type UpdateProveedorInput = z.infer<typeof updateProveedorSchema>;
