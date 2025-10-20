import { Router } from 'express';
import { AlmacenController } from '../controllers/almacen.controller';

export const almacenRoutes = (): Router => {
    const router = Router();
    const controller = new AlmacenController();

    router.get('/', controller.list);
    router.get('/alertas', controller.alertas);
    router.get('/:codigoArticulo', controller.getByCodigoArticulo);
    router.post('/', controller.create);
    router.post('/ajustar', controller.ajustar);
    router.put('/:codigoArticulo', controller.update);
    router.delete('/:codigoArticulo', controller.delete);

    return router;
};
