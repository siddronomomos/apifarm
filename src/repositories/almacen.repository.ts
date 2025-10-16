import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { Almacen, AlertaInventario, CreateAlmacenDTO, UpdateAlmacenDTO } from '../models/almacen';

interface AlmacenRow extends RowDataPacket {
    almacen_id: number;
    codigo_articulo: string;
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    ubicacion: string | null;
    ultima_actualizacion: Date;
}

const mapAlmacen = (row: AlmacenRow): Almacen => ({
    almacenId: row.almacen_id,
    codigoArticulo: row.codigo_articulo,
    cantidad: Number(row.cantidad),
    stockMinimo: Number(row.stock_minimo),
    stockMaximo: Number(row.stock_maximo),
    ubicacion: row.ubicacion ?? undefined,
    ultimaActualizacion: row.ultima_actualizacion
});

export class AlmacenRepository {
    async findAll(): Promise<Almacen[]> {
        const [rows] = await pool.execute<AlmacenRow[]>(
            `SELECT almacen_id, codigo_articulo, cantidad, stock_minimo, stock_maximo, ubicacion, ultima_actualizacion
             FROM Almacen
             ORDER BY codigo_articulo`
        );
        return rows.map(mapAlmacen);
    }

    async findByCodigoArticulo(codigoArticulo: string): Promise<Almacen | null> {
        const [rows] = await pool.execute<AlmacenRow[]>(
            `SELECT almacen_id, codigo_articulo, cantidad, stock_minimo, stock_maximo, ubicacion, ultima_actualizacion
             FROM Almacen
             WHERE codigo_articulo = ?`,
            [codigoArticulo]
        );
        if (rows.length === 0) return null;
        return mapAlmacen(rows[0]);
    }

    async create(data: CreateAlmacenDTO): Promise<Almacen> {
        await pool.execute<ResultSetHeader>(
            `INSERT INTO Almacen (codigo_articulo, cantidad, stock_minimo, stock_maximo, ubicacion) VALUES (?, ?, ?, ?, ?)`,
            [
                data.codigoArticulo,
                data.cantidad ?? 0,
                data.stockMinimo ?? 10,
                data.stockMaximo ?? 1000,
                data.ubicacion ?? null
            ]
        );

        const almacen = await this.findByCodigoArticulo(data.codigoArticulo);
        if (!almacen) {
            throw new Error('No se pudo recuperar el inventario creado');
        }
        return almacen;
    }

    async update(codigoArticulo: string, data: UpdateAlmacenDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: Array<string | number | null> = [];
        if (data.cantidad !== undefined) {
            fields.push('cantidad = ?');
            values.push(data.cantidad);
        }
        if (data.stockMinimo !== undefined) {
            fields.push('stock_minimo = ?');
            values.push(data.stockMinimo);
        }
        if (data.stockMaximo !== undefined) {
            fields.push('stock_maximo = ?');
            values.push(data.stockMaximo);
        }
        if (data.ubicacion !== undefined) {
            fields.push('ubicacion = ?');
            values.push(data.ubicacion ?? null);
        }
        if (fields.length === 0) return false;
        values.push(codigoArticulo);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Almacen SET ${fields.join(', ')} WHERE codigo_articulo = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(codigoArticulo: string): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM Almacen WHERE codigo_articulo = ?',
            [codigoArticulo]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async ajustarCantidad(codigoArticulo: string, diferencia: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Almacen SET cantidad = cantidad + ? WHERE codigo_articulo = ?`,
            [diferencia, codigoArticulo]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async getAlertas(): Promise<AlertaInventario[]> {
        const [rows] = await pool.execute<Array<RowDataPacket & AlertaInventario>>(
            `SELECT codigo, descripcion, precio, cantidad, stock_minimo as stockMinimo, stock_maximo as stockMaximo, estado_stock as estadoStock
             FROM v_inventario_alertas`
        );
        return rows.map((row) => ({
            codigo: row.codigo,
            descripcion: row.descripcion,
            cantidad: Number(row.cantidad),
            stockMinimo: Number(row.stockMinimo),
            estadoStock: row.estadoStock as AlertaInventario['estadoStock']
        }));
    }
}

export default new AlmacenRepository();
