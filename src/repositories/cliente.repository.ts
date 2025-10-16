import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import { Cliente, ClienteConDescuento, NewCliente, UpdateCliente } from '../models';

interface ClienteRow extends RowDataPacket {
    cliente_id: number;
    usuario_id: number;
    nombre_completo: string;
    rfc: string | null;
    direccion: string | null;
    telefono: string | null;
    puntos_acumulados: number;
    total_gastado: number;
    activo: number;
    fecha_registro: Date;
}

interface ClienteConDescuentoRow extends ClienteRow {
    descuentos_disponibles: number;
}

const mapCliente = (row: ClienteRow): Cliente => ({
    clienteId: row.cliente_id,
    usuarioId: row.usuario_id,
    nombreCompleto: row.nombre_completo,
    rfc: row.rfc ?? undefined,
    direccion: row.direccion ?? undefined,
    telefono: row.telefono ?? undefined,
    puntosAcumulados: Number(row.puntos_acumulados ?? 0),
    totalGastado: Number(row.total_gastado ?? 0),
    activo: row.activo === 1,
    fechaRegistro: row.fecha_registro
});

const mapClienteConDescuento = (row: ClienteConDescuentoRow): ClienteConDescuento => ({
    ...mapCliente(row),
    descuentoDisponible: Number(row.puntos_acumulados ?? 0) >= 50,
    descuentosDisponibles: Number(row.descuentos_disponibles ?? 0)
});

export class ClienteRepository {
    async findAll(includeInactivos = false): Promise<Cliente[]> {
        const where = includeInactivos ? '' : 'WHERE activo = TRUE';
        const [rows] = await pool.execute<ClienteRow[]>(
            `SELECT cliente_id, usuario_id, nombre_completo, rfc, direccion, telefono,
                    puntos_acumulados, total_gastado, activo, fecha_registro
             FROM Clientes
             ${where}
             ORDER BY nombre_completo`
        );
        return rows.map(mapCliente);
    }

    async findById(id: number): Promise<Cliente | null> {
        const [rows] = await pool.execute<ClienteRow[]>(
            `SELECT cliente_id, usuario_id, nombre_completo, rfc, direccion, telefono,
                    puntos_acumulados, total_gastado, activo, fecha_registro
             FROM Clientes
             WHERE cliente_id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return null;
        }
        return mapCliente(rows[0]);
    }

    async findByRFC(rfc: string): Promise<Cliente | null> {
        const [rows] = await pool.execute<ClienteRow[]>(
            `SELECT cliente_id, usuario_id, nombre_completo, rfc, direccion, telefono,
                    puntos_acumulados, total_gastado, activo, fecha_registro
             FROM Clientes
             WHERE rfc = ?`,
            [rfc]
        );
        if (rows.length === 0) {
            return null;
        }
        return mapCliente(rows[0]);
    }

    async create(data: NewCliente): Promise<Cliente> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Clientes (usuario_id, nombre_completo, rfc, direccion, telefono)
             VALUES (?, ?, ?, ?, ?)` ,
            [
                data.usuarioId,
                data.nombreCompleto,
                data.rfc || null,
                data.direccion || null,
                data.telefono || null
            ]
        );

        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('No se pudo recuperar el cliente creado');
        }
        return created;
    }

    async update(id: number, data: UpdateCliente): Promise<boolean> {
        const fields: string[] = [];
        const values: Array<string | number | boolean | null> = [];

        if (data.nombreCompleto !== undefined) {
            fields.push('nombre_completo = ?');
            values.push(data.nombreCompleto);
        }
        if (data.rfc !== undefined) {
            fields.push('rfc = ?');
            values.push(data.rfc || null);
        }
        if (data.direccion !== undefined) {
            fields.push('direccion = ?');
            values.push(data.direccion || null);
        }
        if (data.telefono !== undefined) {
            fields.push('telefono = ?');
            values.push(data.telefono || null);
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
            `UPDATE Clientes SET ${fields.join(', ')} WHERE cliente_id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Clientes SET activo = FALSE WHERE cliente_id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    async getWithDescuento(id: number): Promise<ClienteConDescuento | null> {
        const [rows] = await pool.execute<ClienteConDescuentoRow[]>(
            `SELECT c.*, FLOOR(c.puntos_acumulados / 50) AS descuentos_disponibles
             FROM Clientes c
             WHERE c.cliente_id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return null;
        }
        return mapClienteConDescuento(rows[0]);
    }
}
