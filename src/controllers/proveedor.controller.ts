import { Request, Response, NextFunction } from 'express';
import { ProveedorService } from '../services/proveedor.service';
import { HttpError } from '../utils/httpError';

export class ProveedorController {
    private readonly service = new ProveedorService();

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const includeInactivos = req.query.includeInactivos === 'true';
            const proveedores = await this.service.list(includeInactivos);
            res.json(proveedores);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req.params.id);
            const proveedor = await this.service.getById(id);
            res.json(proveedor);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const proveedor = await this.service.create(req.body);
            if (!proveedor || !proveedor.proveedorId) {
                throw new HttpError(500, 'No se pudo crear el proveedor');
            }
            res.status(201).json(proveedor);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req.params.id);
            const proveedor = await this.service.update(id, req.body);
            res.json(proveedor);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = this.parseId(req.params.id);
            await this.service.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    private parseId(raw: string): number {
        const id = Number(raw);
        if (Number.isNaN(id) || id <= 0) {
            throw new HttpError(400, 'El identificador debe ser un número positivo');
        }
        return id;
    }
}
