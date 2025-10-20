import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './users.routes';
import { clienteRoutes } from './clientes.routes';
import { articuloRoutes } from './articulos.routes';
import { proveedorRoutes } from './proveedores.routes';
import { almacenRoutes } from './almacen.routes';

export const registerRoutes = (): Router => {
    const router = Router();

    router.use('/auth', authRoutes());
    router.use('/users', userRoutes());
    router.use('/clientes', clienteRoutes());
    router.use('/articulos', articuloRoutes());
    router.use('/proveedores', proveedorRoutes());
    router.use('/almacen', almacenRoutes());

    return router;
};
