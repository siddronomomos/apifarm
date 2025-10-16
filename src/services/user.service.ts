import { createUserSchema, updateUserSchema } from '../validators';
import { hashPassword } from '../utils/password';
import { UserRepository } from '../repositories/user.repository';
import { handleDbError } from '../utils/dbErrors';
import { HttpError } from '../utils/httpError';
import { User } from '../models';

const sanitize = (user: User): Omit<User, 'passwordHash'> => {
    const { passwordHash, ...rest } = user;
    return rest;
};

export class UserService {
    private readonly repo = new UserRepository();

    async list(includeInactivos = false): Promise<Array<Omit<User, 'passwordHash'>>> {
        const users = await this.repo.findAll(includeInactivos);
        return users.map(sanitize);
    }

    async getById(id: number): Promise<Omit<User, 'passwordHash'>> {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new HttpError(404, 'Usuario no encontrado');
        }
        return sanitize(user);
    }

    async create(payload: unknown): Promise<Omit<User, 'passwordHash'>> {
        const data = createUserSchema.parse(payload);

        const existing = await this.repo.findByUsername(data.username);
        if (existing && existing.activo) {
            throw new HttpError(409, 'El email ya está registrado');
        }

        const passwordHash = await hashPassword(data.password);

        try {
            const created = await this.repo.create({
                nombre: data.nombre,
                username: data.username,
                perfil: data.perfil,
                passwordHash
            });
            return sanitize(created);
        } catch (error) {
            handleDbError(error, 'No se pudo crear el usuario');
            throw error;
        }
    }

    async update(id: number, payload: unknown): Promise<Omit<User, 'passwordHash'>> {
        const data = updateUserSchema.parse(payload);

        const user = await this.repo.findById(id);
        if (!user) {
            throw new HttpError(404, 'Usuario no encontrado');
        }

        if (data.username && data.username !== user.username) {
            const existing = await this.repo.findByUsername(data.username);
            if (existing && existing.usuarioId !== id) {
                throw new HttpError(409, 'El email ya está registrado');
            }
        }

        const passwordHash = data.password ? await hashPassword(data.password) : undefined;

        try {
            const success = await this.repo.update(id, {
                nombre: data.nombre,
                username: data.username,
                perfil: data.perfil,
                passwordHash,
                activo: data.activo
            });

            if (!success) {
                throw new HttpError(404, 'Usuario no encontrado');
            }

            const updated = await this.repo.findById(id);
            if (!updated) {
                throw new HttpError(404, 'Usuario no encontrado');
            }
            return sanitize(updated);
        } catch (error) {
            handleDbError(error, 'No se pudo actualizar el usuario');
            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const success = await this.repo.delete(id);
            if (!success) {
                throw new HttpError(404, 'Usuario no encontrado');
            }
        } catch (error) {
            handleDbError(error, 'No se pudo eliminar el usuario');
            throw error;
        }
    }
}
