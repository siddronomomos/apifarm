import { ArticuloRepository } from '../repositories/articulo.repository';
import { createArticuloSchema, updateArticuloSchema } from '../validators';
import { handleDbError } from '../utils/dbErrors';
import { HttpError } from '../utils/httpError';
import { Articulo, ArticuloConInventario } from '../models';

const cleanOptionalStrings = (payload: Record<string, unknown>, keys: string[]): void => {
    keys.forEach((key) => {
        if (payload[key] === '') {
            payload[key] = undefined;
        }
    });
};

export class ArticuloService {
    private readonly repo = new ArticuloRepository();

    async list(includeInactivos = false): Promise<Articulo[]> {
        return this.repo.findAll(includeInactivos);
    }

    async listWithInventory(includeInactivos = false): Promise<ArticuloConInventario[]> {
        return this.repo.findAllWithInventory(includeInactivos);
    }

    async getByCodigo(codigo: string): Promise<Articulo> {
        const articulo = await this.repo.findByCodigo(codigo);
        if (!articulo) {
            throw new HttpError(404, 'Artículo no encontrado');
        }
        return articulo;
    }

    async getByCodigoWithInventory(codigo: string): Promise<ArticuloConInventario> {
        const articulo = await this.repo.findByCodigoWithInventory(codigo);
        if (!articulo) {
            throw new HttpError(404, 'Artículo no encontrado');
        }
        return articulo;
    }

    async create(payload: unknown): Promise<Articulo> {
        const data = createArticuloSchema.parse(payload);
        cleanOptionalStrings(data, ['categoria', 'unidadMedida']);

        const exists = await this.repo.exists(data.codigo);
        if (exists) {
            throw new HttpError(409, 'El código del artículo ya está registrado');
        }

        try {
            await this.repo.create({
                codigo: data.codigo,
                descripcion: data.descripcion,
                precio: data.precio,
                costo: data.costo,
                categoria: data.categoria,
                unidadMedida: data.unidadMedida
            });
            const created = await this.repo.findByCodigo(data.codigo);
            if (!created) {
                throw new HttpError(500, 'No se pudo recuperar el artículo creado');
            }
            return created;
        } catch (error) {
            handleDbError(error, 'No se pudo crear el artículo');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al crear artículo');
        }
    }

    async update(codigo: string, payload: unknown): Promise<Articulo> {
        const data = updateArticuloSchema.parse(payload);
        cleanOptionalStrings(data, ['categoria', 'unidadMedida']);

        const existing = await this.repo.findByCodigo(codigo);
        if (!existing) {
            throw new HttpError(404, 'Artículo no encontrado');
        }

        try {
            const success = await this.repo.update(codigo, {
                descripcion: data.descripcion,
                precio: data.precio,
                costo: data.costo,
                categoria: data.categoria,
                unidadMedida: data.unidadMedida,
                activo: data.activo
            });

            if (!success) {
                throw new HttpError(404, 'Artículo no encontrado');
            }

            const updated = await this.repo.findByCodigo(codigo);
            if (!updated) {
                throw new HttpError(404, 'Artículo no encontrado');
            }
            return updated;
        } catch (error) {
            handleDbError(error, 'No se pudo actualizar el artículo');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al actualizar artículo');
        }
    }

    async delete(codigo: string): Promise<void> {
        try {
            const success = await this.repo.delete(codigo);
            if (!success) {
                throw new HttpError(404, 'Artículo no encontrado');
            }
        } catch (error) {
            handleDbError(error, 'No se pudo eliminar el artículo');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al eliminar artículo');
        }
    }

    async search(term: string, includeInactivos = false): Promise<Articulo[]> {
        return this.repo.searchByDescripcion(term, includeInactivos);
    }

    async listByCategoria(categoria: string, includeInactivos = false): Promise<Articulo[]> {
        return this.repo.findByCategoria(categoria, includeInactivos);
    }

    async categorias(): Promise<string[]> {
        return this.repo.getCategorias();
    }
}
