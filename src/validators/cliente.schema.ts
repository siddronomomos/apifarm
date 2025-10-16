import { z } from 'zod';

export const createClienteSchema = z.object({
    usuarioId: z.number().int().positive('El ID del usuario es requerido'),
    nombreCompleto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
    rfc: z.string().length(13, 'El RFC debe tener 13 caracteres').toUpperCase().optional().or(z.literal('')),
    direccion: z.string().optional(),
    telefono: z.string().max(20).optional(),
});

export const updateClienteSchema = z.object({
    nombreCompleto: z.string().min(3).max(200).optional(),
    rfc: z.string().length(13).toUpperCase().optional().or(z.literal('')),
    direccion: z.string().optional(),
    telefono: z.string().max(20).optional(),
    activo: z.boolean().optional(),
});

