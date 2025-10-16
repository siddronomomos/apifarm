import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { Venta, CreateVentaDTO, UpdateVentaDTO } from '../models/venta';

export class VentaRepository {
    async findAll(): Promise<Venta[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio, fecha, cliente_id as clienteId, usuario_id as usuarioId, total, puntos_generados as puntosGenerados, puntos_usados as puntosUsados, estado
             FROM Ventas
             ORDER BY fecha DESC`
        );
        return rows as Venta[];
    }

    async findByFolio(folio: number): Promise<Venta | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio, fecha, cliente_id as clienteId, usuario_id as usuarioId, total, puntos_generados as puntosGenerados, puntos_usados as puntosUsados, estado
             FROM Ventas
             WHERE folio = ?`,
            [folio]
        );
        if (rows.length === 0) return null;
        return rows[0] as Venta;
    }

    async create(data: CreateVentaDTO): Promise<number> {
        // fecha, total, puntos_usados, estado are handled by DB/triggers
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Ventas (cliente_id, usuario_id, notas) VALUES (?, ?, ?)`,
            [data.clienteId, data.usuarioId, data.notas || null]
        );
        return (result as ResultSetHeader).insertId;
    }

    async update(folio: number, data: UpdateVentaDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.estado !== undefined) {
            fields.push('estado = ?');
            values.push(data.estado);
        }
        if (data.notas !== undefined) {
            fields.push('notas = ?');
            values.push(data.notas);
        }
        if (fields.length === 0) return false;
        values.push(folio);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Ventas SET ${fields.join(', ')} WHERE folio = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(folio: number): Promise<boolean> {
        // Soft delete: set estado = 'cancelada'
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Ventas SET estado = 'cancelada' WHERE folio = ?`,
            [folio]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }
}

export default new VentaRepository();
