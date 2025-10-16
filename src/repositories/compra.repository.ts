import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { Compra, CreateCompraDTO, UpdateCompraDTO } from '../models/compra';

export class CompraRepository {
    async findAll(): Promise<Compra[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio_compra as folioCompra, fecha, proveedor_id as proveedorId, usuario_id as usuarioId, subtotal, iva, total, estado, fecha_recepcion as fechaRecepcion, notas
             FROM Compras
             ORDER BY fecha DESC`
        );
        return rows as Compra[];
    }

    async findByFolio(folioCompra: number): Promise<Compra | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio_compra as folioCompra, fecha, proveedor_id as proveedorId, usuario_id as usuarioId, subtotal, iva, total, estado, fecha_recepcion as fechaRecepcion, notas
             FROM Compras
             WHERE folio_compra = ?`,
            [folioCompra]
        );
        if (rows.length === 0) return null;
        return rows[0] as Compra;
    }

    async create(data: CreateCompraDTO): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Compras (proveedor_id, usuario_id, iva, notas) VALUES (?, ?, ?, ?)`,
            [data.proveedorId, data.usuarioId, data.iva || 0, data.notas || null]
        );
        return (result as ResultSetHeader).insertId;
    }

    async update(folioCompra: number, data: UpdateCompraDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.estado !== undefined) {
            fields.push('estado = ?');
            values.push(data.estado);
        }
        if (data.iva !== undefined) {
            fields.push('iva = ?');
            values.push(data.iva);
        }
        if (data.notas !== undefined) {
            fields.push('notas = ?');
            values.push(data.notas);
        }
        if (fields.length === 0) return false;
        values.push(folioCompra);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Compras SET ${fields.join(', ')} WHERE folio_compra = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(folioCompra: number): Promise<boolean> {
        // Soft delete: set estado = 'cancelada'
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Compras SET estado = 'cancelada' WHERE folio_compra = ?`,
            [folioCompra]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }
}

export default new CompraRepository();
