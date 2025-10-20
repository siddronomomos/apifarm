import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { Articulo, CreateArticuloDTO, UpdateArticuloDTO, ArticuloConInventario } from '../models/articulo';

export class ArticuloRepository {
    async findAll(includeInactivos = false): Promise<Articulo[]> {
        const where = includeInactivos ? '' : 'WHERE activo = TRUE';
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT codigo, descripcion, precio, costo, categoria, unidad_medida as unidadMedida, 
                    activo, fecha_registro as fechaRegistro
             FROM Articulos
             ${where}
             ORDER BY descripcion`
        );
        return rows as Articulo[];
    }

    async findAllWithInventory(includeInactivos = false): Promise<ArticuloConInventario[]> {
        const where = includeInactivos ? '' : 'WHERE a.activo = TRUE';
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT a.codigo, a.descripcion, a.precio, a.costo, a.categoria, 
                    a.unidad_medida as unidadMedida, a.activo, a.fecha_registro as fechaRegistro,
                    alm.cantidad, alm.stock_minimo as stockMinimo, alm.stock_maximo as stockMaximo,
                    CASE 
                        WHEN alm.cantidad <= alm.stock_minimo THEN 'BAJO'
                        WHEN alm.cantidad >= alm.stock_maximo THEN 'EXCESO'
                        ELSE 'OK'
                    END as estadoStock
             FROM Articulos a
             LEFT JOIN Almacen alm ON a.codigo = alm.codigo_articulo
             ${where}
             ORDER BY a.descripcion`
        );
        return rows as ArticuloConInventario[];
    }

    async findByCodigo(codigo: string): Promise<Articulo | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT codigo, descripcion, precio, costo, categoria, unidad_medida as unidadMedida, 
                    activo, fecha_registro as fechaRegistro
             FROM Articulos
             WHERE codigo = ?`,
            [codigo]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Articulo;
    }

    async findByCodigoWithInventory(codigo: string): Promise<ArticuloConInventario | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT a.codigo, a.descripcion, a.precio, a.costo, a.categoria, 
                    a.unidad_medida as unidadMedida, a.activo, a.fecha_registro as fechaRegistro,
                    alm.cantidad, alm.stock_minimo as stockMinimo, alm.stock_maximo as stockMaximo,
                    CASE 
                        WHEN alm.cantidad <= alm.stock_minimo THEN 'BAJO'
                        WHEN alm.cantidad >= alm.stock_maximo THEN 'EXCESO'
                        ELSE 'OK'
                    END as estadoStock
             FROM Articulos a
             LEFT JOIN Almacen alm ON a.codigo = alm.codigo_articulo
             WHERE a.codigo = ?`,
            [codigo]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as ArticuloConInventario;
    }

    async create(data: CreateArticuloDTO): Promise<string> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Articulos (codigo, descripcion, precio, costo, categoria, unidad_medida)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.codigo,
                data.descripcion,
                data.precio,
                data.costo || 0,
                data.categoria || null,
                data.unidadMedida || 'PZA'
            ]
        );

        // Create corresponding inventory record
        await pool.execute(
            `INSERT INTO Almacen (codigo_articulo, cantidad, stock_minimo, stock_maximo)
             VALUES (?, 0, 10, 1000)`,
            [data.codigo]
        );

        return data.codigo;
    }

    async update(codigo: string, data: UpdateArticuloDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.descripcion !== undefined) {
            fields.push('descripcion = ?');
            values.push(data.descripcion);
        }
        if (data.precio !== undefined) {
            fields.push('precio = ?');
            values.push(data.precio);
        }
        if (data.costo !== undefined) {
            fields.push('costo = ?');
            values.push(data.costo);
        }
        if (data.categoria !== undefined) {
            fields.push('categoria = ?');
            values.push(data.categoria);
        }
        if (data.unidadMedida !== undefined) {
            fields.push('unidad_medida = ?');
            values.push(data.unidadMedida);
        }
        if (data.activo !== undefined) {
            fields.push('activo = ?');
            values.push(data.activo);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(codigo);

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Articulos SET ${fields.join(', ')} WHERE codigo = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    async delete(codigo: string): Promise<boolean> {
        // Soft delete
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE Articulos SET activo = FALSE WHERE codigo = ?',
            [codigo]
        );

        return result.affectedRows > 0;
    }

    async exists(codigo: string): Promise<boolean> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT 1 FROM Articulos WHERE codigo = ?',
            [codigo]
        );
        return rows.length > 0;
    }

    async searchByDescripcion(term: string, includeInactivos = false): Promise<Articulo[]> {
        const where = includeInactivos ? '' : 'AND activo = TRUE';
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT codigo, descripcion, precio, costo, categoria, unidad_medida as unidadMedida, 
                    activo, fecha_registro as fechaRegistro
             FROM Articulos
             WHERE (descripcion LIKE ? OR codigo LIKE ?)
             ${where}
             ORDER BY descripcion
             LIMIT 50`,
            [`%${term}%`, `%${term}%`]
        );
        return rows as Articulo[];
    }

    async findByCategoria(categoria: string, includeInactivos = false): Promise<Articulo[]> {
        const where = includeInactivos ? '' : 'AND activo = TRUE';
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT codigo, descripcion, precio, costo, categoria, unidad_medida as unidadMedida, 
                    activo, fecha_registro as fechaRegistro
             FROM Articulos
             WHERE categoria = ?
             ${where}
             ORDER BY descripcion`,
            [categoria]
        );
        return rows as Articulo[];
    }

    async getCategorias(): Promise<string[]> {
        const [rows] = await pool.execute<Array<RowDataPacket & { categoria: string | null }>>(
            `SELECT DISTINCT categoria 
             FROM Articulos 
             WHERE activo = TRUE AND categoria IS NOT NULL
             ORDER BY categoria`
        );
        const categorias: string[] = [];
        for (const row of rows) {
            if (row.categoria) {
                categorias.push(row.categoria);
            }
        }
        return categorias;
    }
}

export default new ArticuloRepository();
