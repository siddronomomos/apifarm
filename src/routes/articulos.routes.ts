import { Router } from 'express';
import { ArticuloController } from '../controllers/articulo.controller';

export const articuloRoutes = (): Router => {
    const router = Router();
    const controller = new ArticuloController();

    router.get('/', controller.list);
    router.get('/inventario', controller.listInventario);
    router.get('/categorias', controller.categorias);
    router.get('/buscar', controller.search);
    router.get('/:codigo', controller.getByCodigo);
    router.post('/', controller.create);
    router.put('/:codigo', controller.update);
    router.delete('/:codigo', controller.delete);

    return router;
};
