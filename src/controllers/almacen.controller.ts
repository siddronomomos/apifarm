import { Request, Response, NextFunction } from 'express';
import { AlmacenService } from '../services/almacen.service';
import { HttpError } from '../utils/httpError';

export class AlmacenController {
    private readonly service = new AlmacenService();

    list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.list();
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    getByCodigoArticulo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigoArticulo = this.parseCodigoArticulo(req.params.codigoArticulo);
            const almacen = await this.service.getByCodigoArticulo(codigoArticulo);
            res.json(almacen);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const almacen = await this.service.create(req.body);
            res.status(201).json(almacen);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigoArticulo = this.parseCodigoArticulo(req.params.codigoArticulo);
            const almacen = await this.service.update(codigoArticulo, req.body);
            res.json(almacen);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigoArticulo = this.parseCodigoArticulo(req.params.codigoArticulo);
            await this.service.delete(codigoArticulo);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    ajustar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const almacen = await this.service.ajustarInventario(req.body);
            res.json(almacen);
        } catch (error) {
            next(error);
        }
    };

    alertas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const alertas = await this.service.alertas();
            res.json(alertas);
        } catch (error) {
            next(error);
        }
    };

    private parseCodigoArticulo(raw: string): string {
        const codigo = raw?.trim();
        if (!codigo) {
            throw new HttpError(400, 'El código de artículo es requerido');
        }
        return codigo;
    }
}
