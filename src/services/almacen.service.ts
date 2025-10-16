import { AlmacenRepository } from '../repositories/almacen.repository';
import { ArticuloRepository } from '../repositories/articulo.repository';
import { createAlmacenSchema, updateAlmacenSchema, ajusteInventarioSchema } from '../validators';
import { handleDbError } from '../utils/dbErrors';
import { HttpError } from '../utils/httpError';
import { AlertaInventario, Almacen } from '../models';

export class AlmacenService {
    private readonly repo = new AlmacenRepository();
    private readonly articuloRepo = new ArticuloRepository();

    async list(): Promise<Almacen[]> {
        return this.repo.findAll();
    }

    async getByCodigoArticulo(codigoArticulo: string): Promise<Almacen> {
        const almacen = await this.repo.findByCodigoArticulo(codigoArticulo);
        if (!almacen) {
            throw new HttpError(404, 'Inventario no encontrado para el artículo');
        }
        return almacen;
    }

    async create(payload: unknown): Promise<Almacen> {
        const data = createAlmacenSchema.parse(payload);

        const articulo = await this.articuloRepo.findByCodigo(data.codigoArticulo);
        if (!articulo) {
            throw new HttpError(404, 'Artículo no encontrado');
        }

        const existing = await this.repo.findByCodigoArticulo(data.codigoArticulo);
        if (existing) {
            throw new HttpError(409, 'El artículo ya cuenta con inventario registrado');
        }

        try {
            return await this.repo.create({
                codigoArticulo: data.codigoArticulo,
                cantidad: data.cantidad,
                stockMinimo: data.stockMinimo,
                stockMaximo: data.stockMaximo,
                ubicacion: data.ubicacion
            });
        } catch (error) {
            handleDbError(error, 'No se pudo crear el registro de almacén');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al crear registro de almacén');
        }
    }

    async update(codigoArticulo: string, payload: unknown): Promise<Almacen> {
        const data = updateAlmacenSchema.parse(payload);

        const existing = await this.repo.findByCodigoArticulo(codigoArticulo);
        if (!existing) {
            throw new HttpError(404, 'Inventario no encontrado para el artículo');
        }

        try {
            const success = await this.repo.update(codigoArticulo, data);
            if (!success) {
                throw new HttpError(404, 'Inventario no encontrado para el artículo');
            }

            const updated = await this.repo.findByCodigoArticulo(codigoArticulo);
            if (!updated) {
                throw new HttpError(500, 'No se pudo recuperar el inventario actualizado');
            }
            return updated;
        } catch (error) {
            handleDbError(error, 'No se pudo actualizar el registro de almacén');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al actualizar registro de almacén');
        }
    }

    async delete(codigoArticulo: string): Promise<void> {
        const existing = await this.repo.findByCodigoArticulo(codigoArticulo);
        if (!existing) {
            throw new HttpError(404, 'Inventario no encontrado para el artículo');
        }

        try {
            const success = await this.repo.delete(codigoArticulo);
            if (!success) {
                throw new HttpError(404, 'Inventario no encontrado para el artículo');
            }
        } catch (error) {
            handleDbError(error, 'No se pudo eliminar el registro de almacén');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al eliminar registro de almacén');
        }
    }

    async ajustarInventario(payload: unknown): Promise<Almacen> {
        const data = ajusteInventarioSchema.parse(payload);

        const articulo = await this.articuloRepo.findByCodigo(data.codigoArticulo);
        if (!articulo) {
            throw new HttpError(404, 'Artículo no encontrado');
        }

        const almacen = await this.repo.findByCodigoArticulo(data.codigoArticulo);
        if (!almacen) {
            throw new HttpError(404, 'Inventario no encontrado para el artículo');
        }

        const nuevaCantidad = almacen.cantidad + data.cantidad;
        if (nuevaCantidad < 0) {
            throw new HttpError(400, 'El ajuste dejaría la existencia en negativo');
        }

        try {
            const success = await this.repo.update(data.codigoArticulo, { cantidad: nuevaCantidad });
            if (!success) {
                throw new HttpError(500, 'No se pudo aplicar el ajuste de inventario');
            }

            const actualizado = await this.repo.findByCodigoArticulo(data.codigoArticulo);
            if (!actualizado) {
                throw new HttpError(500, 'No se pudo recuperar el inventario ajustado');
            }
            return actualizado;
        } catch (error) {
            handleDbError(error, 'No se pudo ajustar el inventario');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al ajustar inventario');
        }
    }

    async alertas(): Promise<AlertaInventario[]> {
        return this.repo.getAlertas();
    }
}
