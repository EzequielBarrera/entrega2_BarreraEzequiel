import { Router } from 'express'
const router = new Router()
import ProductController from '../controller/productsController.js'
const productController = new ProductController()

router.get('/', productController.getProductsController)

export default router