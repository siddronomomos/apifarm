import { Router } from 'express';
import { ProveedorController } from '../controllers/proveedor.controller';

export const proveedorRoutes = (): Router => {
    const router = Router();
    const controller = new ProveedorController();

    router.get('/', controller.list);
    router.get('/:id', controller.getById);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);

    return router;
};
