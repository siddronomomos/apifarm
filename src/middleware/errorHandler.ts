import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpError) {
        res.status(err.status).json({
            message: err.message,
            details: err.details ?? null
        });
        return;
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Error de validación',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code
            }))
        });
        return;
    }

    console.error('[UNHANDLED_ERROR]', err);
    res.status(500).json({ message: 'Error interno del servidor' });
};
