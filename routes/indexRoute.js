import { Router } from 'express'
const router = new Router()
import ProductController from '../dao/mongoManagers/productController.js'
const productManager = new ProductController()
import jwt from 'jsonwebtoken'

router.get('/', async (req, res) => {
    const { query, limit, page } = req.query;
    const data = await productManager.getProducts(query, limit, page);

    let products = data.docs.map((product) => {
        return {
            title: product.title,
            _id: product._id,
            price: product.price,
            description: product.description,
            thumbnail: product.thumbnail,
            code: product.code,
            stock: product.stock,
            status: product.status,
            category: product.category,
        };
    });

    const { docs, ...rest } = data;
    let links = [];

    for (let i = 1; i < rest.totalPages + 1; i++) {
        links.push({ label: i, href: 'http://localhost:8080/index/?page=' + i });
    }

    // Obtener el token desde la cookie
    const token = req.cookies.cookieToken;
    if (!token) {
        return res.status(401).send('Token missing in cookies');
    }

    // Verificar el token
    jwt.verify(token, 'tokenSecreto', (err, user) => {
        if (err) {
            console.error('JWT Error:', err);
            return res.status(403).send('User not authorized');
        }

        return res.status(200).render('index', {
            products: products,
            pagination: rest,
            links,
            user: req.session.user,
        });
    });
});

export default router