import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import { Perfil, User, CreateUserParams, UpdateUserParams } from '../models';

interface UserRow extends RowDataPacket {
    usuario_id: number;
    nombre: string;
    username: string;
    password: string;
    perfil: Perfil;
    activo: number;
    fecha_registro: Date;
}

const mapUser = (row: UserRow): User => ({
    usuarioId: row.usuario_id,
    nombre: row.nombre,
    username: row.username,
    perfil: row.perfil,
    passwordHash: row.password,
    activo: row.activo === 1,
    fechaRegistro: row.fecha_registro
});

export class UserRepository {
    async findAll(includeInactivos = false): Promise<User[]> {
        const where = includeInactivos ? '' : 'WHERE activo = TRUE';
        const [rows] = await pool.execute<UserRow[]>(
            `SELECT usuario_id, nombre, username, password, perfil, activo, fecha_registro
             FROM Usuarios
             ${where}
             ORDER BY nombre`
        );
        return rows.map(mapUser);
    }

    async findById(id: number): Promise<User | null> {
        const [rows] = await pool.execute<UserRow[]>(
            `SELECT usuario_id, nombre, username, password, perfil, activo, fecha_registro
             FROM Usuarios
             WHERE usuario_id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return null;
        }
        return mapUser(rows[0]);
    }

    async findByUsername(username: string): Promise<User | null> {
        const [rows] = await pool.execute<UserRow[]>(
            `SELECT usuario_id, nombre, username, password, perfil, activo, fecha_registro
             FROM Usuarios
             WHERE username = ?`,
            [username]
        );
        if (rows.length === 0) {
            return null;
        }
        return mapUser(rows[0]);
    }

    async create(data: CreateUserParams): Promise<User> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Usuarios (nombre, username, password, perfil)
             VALUES (?, ?, ?, ?)` ,
            [data.nombre, data.username, data.passwordHash, data.perfil]
        );

        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('No se pudo recuperar el usuario creado');
        }
        return created;
    }

    async update(id: number, data: UpdateUserParams): Promise<boolean> {
        const fields: string[] = [];
        const values: Array<string | number | boolean> = [];

        if (data.nombre !== undefined) {
            fields.push('nombre = ?');
            values.push(data.nombre);
        }
        if (data.username !== undefined) {
            fields.push('username = ?');
            values.push(data.username);
        }
        if (data.perfil !== undefined) {
            fields.push('perfil = ?');
            values.push(data.perfil);
        }
        if (data.passwordHash !== undefined) {
            fields.push('password = ?');
            values.push(data.passwordHash);
        }
        if (data.activo !== undefined) {
            fields.push('activo = ?');
            values.push(data.activo);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Usuarios SET ${fields.join(', ')} WHERE usuario_id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Usuarios SET activo = FALSE WHERE usuario_id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
}
