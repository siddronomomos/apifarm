import { z } from 'zod';

export const perfilSchema = z.enum(['admin', 'gerente', 'cajero']);

export const createUserSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    username: z.string().email('Debe ser un email válido').max(100),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    perfil: perfilSchema
});

export const updateUserSchema = z.object({
    nombre: z.string().min(3).max(100).optional(),
    username: z.string().email().max(100).optional(),
    password: z.string().min(6).optional(),
    perfil: perfilSchema.optional(),
    activo: z.boolean().optional(),
});

