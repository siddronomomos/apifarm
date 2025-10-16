import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { DetalleCompra, CreateDetalleCompraDTO, UpdateDetalleCompraDTO } from '../models/compra';

export class DetalleCompraRepository {
    async findByCompra(folioCompra: number): Promise<DetalleCompra[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio_detalle as folioDetalle, folio_compra as folioCompra, codigo_articulo as codigoArticulo, cantidad, costo_unitario as costoUnitario, subtotal
             FROM Detalle_Compra
             WHERE folio_compra = ?
             ORDER BY folio_detalle`,
            [folioCompra]
        );
        return rows as DetalleCompra[];
    }

    async create(data: CreateDetalleCompraDTO): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Detalle_Compra (folio_compra, codigo_articulo, cantidad, costo_unitario)
             VALUES (?, ?, ?, ?)` ,
            [data.folioCompra, data.codigoArticulo, data.cantidad, data.costoUnitario]
        );
        return (result as ResultSetHeader).insertId;
    }

    async update(folioDetalle: number, data: UpdateDetalleCompraDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.cantidad !== undefined) {
            fields.push('cantidad = ?');
            values.push(data.cantidad);
        }
        if (data.costoUnitario !== undefined) {
            fields.push('costo_unitario = ?');
            values.push(data.costoUnitario);
        }
        if (fields.length === 0) return false;
        values.push(folioDetalle);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Detalle_Compra SET ${fields.join(', ')} WHERE folio_detalle = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(folioDetalle: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM Detalle_Compra WHERE folio_detalle = ?',
            [folioDetalle]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }
}

export default new DetalleCompraRepository();
