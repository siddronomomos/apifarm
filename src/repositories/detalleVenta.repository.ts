import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { DetalleVenta, CreateDetalleVentaDTO, UpdateDetalleVentaDTO } from '../models/venta';

export class DetalleVentaRepository {
    async findByVenta(folioVenta: number): Promise<DetalleVenta[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT folio_detalle as folioDetalle, folio_venta as folioVenta, codigo_articulo as codigoArticulo, cantidad, precio_unitario as precioUnitario, descuento_unitario as descuentoUnitario, subtotal, total
             FROM Detalle_Venta
             WHERE folio_venta = ?
             ORDER BY folio_detalle`,
            [folioVenta]
        );
        return rows as DetalleVenta[];
    }

    async create(data: CreateDetalleVentaDTO): Promise<number> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Detalle_Venta (folio_venta, codigo_articulo, cantidad, precio_unitario, descuento_unitario)
             VALUES (?, ?, ?, ?, ?)` ,
            [data.folioVenta, data.codigoArticulo, data.cantidad, data.precioUnitario, data.descuentoUnitario || 0]
        );
        return (result as ResultSetHeader).insertId;
    }

    async update(folioDetalle: number, data: UpdateDetalleVentaDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        if (data.cantidad !== undefined) {
            fields.push('cantidad = ?');
            values.push(data.cantidad);
        }
        if (data.precioUnitario !== undefined) {
            fields.push('precio_unitario = ?');
            values.push(data.precioUnitario);
        }
        if (data.descuentoUnitario !== undefined) {
            fields.push('descuento_unitario = ?');
            values.push(data.descuentoUnitario);
        }
        if (fields.length === 0) return false;
        values.push(folioDetalle);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Detalle_Venta SET ${fields.join(', ')} WHERE folio_detalle = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(folioDetalle: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM Detalle_Venta WHERE folio_detalle = ?',
            [folioDetalle]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }
}

export default new DetalleVentaRepository();
