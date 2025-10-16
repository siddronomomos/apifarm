import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../db/pool';
import { Proveedor, CreateProveedorDTO, UpdateProveedorDTO } from '../models/proveedor';

interface ProveedorRow extends RowDataPacket {
    proveedor_id: number;
    nombre_empresa: string;
    rfc: string | null;
    contacto: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    activo: number;
    fecha_registro: Date;
}

const mapProveedor = (row: ProveedorRow): Proveedor => ({
    proveedorId: row.proveedor_id,
    nombreEmpresa: row.nombre_empresa,
    rfc: row.rfc ?? undefined,
    contacto: row.contacto ?? undefined,
    telefono: row.telefono ?? undefined,
    email: row.email ?? undefined,
    direccion: row.direccion ?? undefined,
    activo: row.activo === 1,
    fechaRegistro: row.fecha_registro
});

export class ProveedorRepository {
    async findAll(includeInactivos = false): Promise<Proveedor[]> {
        const where = includeInactivos ? '' : 'WHERE activo = TRUE';
        const [rows] = await pool.execute<ProveedorRow[]>(
            `SELECT proveedor_id, nombre_empresa, rfc, contacto, telefono, email, direccion, activo, fecha_registro
             FROM Proveedores
             ${where}
             ORDER BY nombre_empresa`
        );
        return rows.map(mapProveedor);
    }

    async findById(proveedorId: number): Promise<Proveedor | null> {
        const [rows] = await pool.execute<ProveedorRow[]>(
            `SELECT proveedor_id, nombre_empresa, rfc, contacto, telefono, email, direccion, activo, fecha_registro
             FROM Proveedores
             WHERE proveedor_id = ?`,
            [proveedorId]
        );
        if (rows.length === 0) return null;
        return mapProveedor(rows[0]);
    }

    async findByRFC(rfc: string): Promise<Proveedor | null> {
        const [rows] = await pool.execute<ProveedorRow[]>(
            `SELECT proveedor_id, nombre_empresa, rfc, contacto, telefono, email, direccion, activo, fecha_registro
             FROM Proveedores
             WHERE rfc = ?`,
            [rfc]
        );
        if (rows.length === 0) return null;
        return mapProveedor(rows[0]);
    }

    async create(data: CreateProveedorDTO): Promise<Proveedor> {
        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO Proveedores (nombre_empresa, rfc, contacto, telefono, email, direccion)
             VALUES (?, ?, ?, ?, ?, ?)` ,
            [
                data.nombreEmpresa,
                data.rfc || null,
                data.contacto || null,
                data.telefono || null,
                data.email || null,
                data.direccion || null
            ]
        );
        const created = await this.findById(result.insertId);
        if (!created) {
            throw new Error('No se pudo recuperar el proveedor creado');
        }
        return created;
    }

    async update(proveedorId: number, data: UpdateProveedorDTO): Promise<boolean> {
        const fields: string[] = [];
        const values: Array<string | number | boolean | null> = [];
        if (data.nombreEmpresa !== undefined) {
            fields.push('nombre_empresa = ?');
            values.push(data.nombreEmpresa);
        }
        if (data.rfc !== undefined) {
            fields.push('rfc = ?');
            values.push(data.rfc || null);
        }
        if (data.contacto !== undefined) {
            fields.push('contacto = ?');
            values.push(data.contacto || null);
        }
        if (data.telefono !== undefined) {
            fields.push('telefono = ?');
            values.push(data.telefono || null);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email || null);
        }
        if (data.direccion !== undefined) {
            fields.push('direccion = ?');
            values.push(data.direccion || null);
        }
        if (data.activo !== undefined) {
            fields.push('activo = ?');
            values.push(data.activo);
        }
        if (fields.length === 0) return false;
        values.push(proveedorId);
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE Proveedores SET ${fields.join(', ')} WHERE proveedor_id = ?`,
            values
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }

    async delete(proveedorId: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'UPDATE Proveedores SET activo = FALSE WHERE proveedor_id = ?',
            [proveedorId]
        );
        return (result as ResultSetHeader).affectedRows > 0;
    }
}

export default new ProveedorRepository();
