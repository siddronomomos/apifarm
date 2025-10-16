import { ProveedorRepository } from '../repositories/proveedor.repository';
import { createProveedorSchema, updateProveedorSchema } from '../validators';
import { handleDbError } from '../utils/dbErrors';
import { HttpError } from '../utils/httpError';
import { Proveedor } from '../models';

const cleanOptionalStrings = (payload: Record<string, unknown>, keys: string[]): void => {
    keys.forEach((key) => {
        if (payload[key] === '') {
            payload[key] = undefined;
        }
    });
};

export class ProveedorService {
    private readonly repo = new ProveedorRepository();

    async list(includeInactivos = false): Promise<Proveedor[]> {
        return this.repo.findAll(includeInactivos);
    }

    async getById(id: number): Promise<Proveedor> {
        const proveedor = await this.repo.findById(id);
        if (!proveedor) {
            throw new HttpError(404, 'Proveedor no encontrado');
        }
        return proveedor;
    }

    async create(payload: unknown): Promise<Proveedor> {
        const data = createProveedorSchema.parse(payload);
        cleanOptionalStrings(data, ['rfc', 'contacto', 'telefono', 'email', 'direccion']);

        if (data.rfc) {
            const existing = await this.repo.findByRFC(data.rfc);
            if (existing) {
                throw new HttpError(409, 'El RFC del proveedor ya está registrado');
            }
        }

        try {
            return await this.repo.create({
                nombreEmpresa: data.nombreEmpresa,
                rfc: data.rfc,
                contacto: data.contacto,
                telefono: data.telefono,
                email: data.email,
                direccion: data.direccion
            });
        } catch (error) {
            handleDbError(error, 'No se pudo crear el proveedor');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al crear proveedor');
        }
    }

    async update(id: number, payload: unknown): Promise<Proveedor> {
        const data = updateProveedorSchema.parse(payload);
        cleanOptionalStrings(data, ['rfc', 'contacto', 'telefono', 'email', 'direccion']);

        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Proveedor no encontrado');
        }

        if (data.rfc && data.rfc !== existing.rfc) {
            const existingRFC = await this.repo.findByRFC(data.rfc);
            if (existingRFC && existingRFC.proveedorId !== id) {
                throw new HttpError(409, 'El RFC del proveedor ya está registrado');
            }
        }

        try {
            const success = await this.repo.update(id, {
                nombreEmpresa: data.nombreEmpresa,
                rfc: data.rfc,
                contacto: data.contacto,
                telefono: data.telefono,
                email: data.email,
                direccion: data.direccion,
                activo: data.activo
            });

            if (!success) {
                throw new HttpError(404, 'Proveedor no encontrado');
            }

            const updated = await this.repo.findById(id);
            if (!updated) {
                throw new HttpError(404, 'Proveedor no encontrado');
            }

            return updated;
        } catch (error) {
            handleDbError(error, 'No se pudo actualizar el proveedor');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al actualizar proveedor');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const success = await this.repo.delete(id);
            if (!success) {
                throw new HttpError(404, 'Proveedor no encontrado');
            }
        } catch (error) {
            handleDbError(error, 'No se pudo eliminar el proveedor');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al eliminar proveedor');
        }
    }
}
