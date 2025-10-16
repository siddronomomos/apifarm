import { Request, Response, NextFunction } from 'express';
import { ArticuloService } from '../services/articulo.service';
import { HttpError } from '../utils/httpError';

export class ArticuloController {
    private readonly service = new ArticuloService();

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const includeInactivos = req.query.includeInactivos === 'true';
            const withInventory = req.query.conInventario === 'true';

            const data = withInventory
                ? await this.service.listWithInventory(includeInactivos)
                : await this.service.list(includeInactivos);

            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    listInventario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const includeInactivos = req.query.includeInactivos === 'true';
            const data = await this.service.listWithInventory(includeInactivos);
            res.json(data);
        } catch (error) {
            next(error);
        }
    };

    getByCodigo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigo = this.parseCodigo(req.params.codigo);
            const withInventory = req.query.conInventario === 'true';
            const articulo = withInventory
                ? await this.service.getByCodigoWithInventory(codigo)
                : await this.service.getByCodigo(codigo);
            res.json(articulo);
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const articulo = await this.service.create(req.body);
            res.status(201).json(articulo);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigo = this.parseCodigo(req.params.codigo);
            const articulo = await this.service.update(codigo, req.body);
            res.json(articulo);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const codigo = this.parseCodigo(req.params.codigo);
            await this.service.delete(codigo);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const term = String(req.query.q ?? '').trim();
            if (!term) {
                throw new HttpError(400, 'Debe proporcionar el parámetro q');
            }
            const includeInactivos = req.query.includeInactivos === 'true';
            const resultados = await this.service.search(term, includeInactivos);
            res.json(resultados);
        } catch (error) {
            next(error);
        }
    };

    categorias = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categorias = await this.service.categorias();
            res.json(categorias);
        } catch (error) {
            next(error);
        }
    };

    private parseCodigo(raw: string): string {
        const codigo = raw?.trim();
        if (!codigo) {
            throw new HttpError(400, 'El código es requerido');
        }
        return codigo;
    }
}
