import { ClienteRepository } from '../repositories/cliente.repository';
import { createClienteSchema, updateClienteSchema } from '../validators';
import { handleDbError } from '../utils/dbErrors';
import { HttpError } from '../utils/httpError';
import { Cliente, ClienteConDescuento } from '../models';

const sanitizeClientePayload = (payload: { rfc?: string; telefono?: string; direccion?: string }): void => {
    if (payload.rfc === '') payload.rfc = undefined;
    if (payload.telefono === '') payload.telefono = undefined;
    if (payload.direccion === '') payload.direccion = undefined;
};

export class ClienteService {
    private readonly repo = new ClienteRepository();

    async list(includeInactivos = false): Promise<Cliente[]> {
        return this.repo.findAll(includeInactivos);
    }

    async getById(id: number): Promise<Cliente> {
        const cliente = await this.repo.findById(id);
        if (!cliente) {
            throw new HttpError(404, 'Cliente no encontrado');
        }
        return cliente;
    }

    async getLoyaltySummary(id: number): Promise<ClienteConDescuento> {
        const cliente = await this.repo.getWithDescuento(id);
        if (!cliente) {
            throw new HttpError(404, 'Cliente no encontrado');
        }
        return cliente;
    }

    async create(payload: unknown): Promise<Cliente> {
        const data = createClienteSchema.parse(payload);
        sanitizeClientePayload(data);

        if (data.rfc) {
            const existingRFC = await this.repo.findByRFC(data.rfc);
            if (existingRFC) {
                throw new HttpError(409, 'El RFC ya está registrado');
            }
        }

        try {
            return await this.repo.create({
                usuarioId: data.usuarioId,
                nombreCompleto: data.nombreCompleto,
                rfc: data.rfc,
                direccion: data.direccion,
                telefono: data.telefono
            });
        } catch (error) {
            handleDbError(error, 'No se pudo crear el cliente');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al crear el cliente');
        }
    }

    async update(id: number, payload: unknown): Promise<Cliente> {
        const data = updateClienteSchema.parse(payload);
        sanitizeClientePayload(data);

        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new HttpError(404, 'Cliente no encontrado');
        }

        if (data.rfc && data.rfc !== existing.rfc) {
            const existingRFC = await this.repo.findByRFC(data.rfc);
            if (existingRFC && existingRFC.clienteId !== id) {
                throw new HttpError(409, 'El RFC ya está registrado');
            }
        }

        try {
            const success = await this.repo.update(id, {
                nombreCompleto: data.nombreCompleto,
                rfc: data.rfc,
                direccion: data.direccion,
                telefono: data.telefono,
                activo: data.activo
            });
            if (!success) {
                throw new HttpError(404, 'Cliente no encontrado');
            }
            const updated = await this.repo.findById(id);
            if (!updated) {
                throw new HttpError(404, 'Cliente no encontrado');
            }
            return updated;
        } catch (error) {
            handleDbError(error, 'No se pudo actualizar el cliente');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al actualizar el cliente');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const success = await this.repo.delete(id);
            if (!success) {
                throw new HttpError(404, 'Cliente no encontrado');
            }
        } catch (error) {
            handleDbError(error, 'No se pudo eliminar el cliente');
            if (error instanceof Error) {
                throw error;
            }
            throw new HttpError(500, 'Error desconocido al eliminar el cliente');
        }
    }
}
