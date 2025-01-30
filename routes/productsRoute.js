import { Router } from 'express'
import ProductController from '../controller/productsController.js'
const productController = new ProductController()
import { isAdmin } from '../middlewares/middlewares.js'

const router = new Router()

router.get('/', productController.getProductsController)
router.get('/:id', productController.getProductsByIdController)
router.post('/', isAdmin, productController.addProductController)
router.put('/:id', isAdmin, productController.updateProductController)
router.delete('/:id', isAdmin, productController.deleteProductController)

export default router