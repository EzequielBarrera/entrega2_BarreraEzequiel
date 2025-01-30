// server
import express from 'express'
const app = express()

// dependencies
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import config from './config/config.js'
import handlebars from 'express-handlebars'
import initPassport from './passport/passportConfig.js'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// http import
import http from 'http'
const server = http.createServer(app)

// socket import
import { Server } from 'socket.io'
const io = new Server(server)

// mongo
import db from './dao/db.js'
import Product from './dao/models/productModel.js'
import Message from './dao/models/messageModel.js'
import ProductService from './service/productService.js'
const productService = new ProductService()
// import CartService from './service/cartsService.js'
// const cartService = new CartService()

// routes
import authRoute from './routes/authRoute.js'
import chatRoute from './routes/chatRoute.js'
import cartsRoute from './routes/cartsRoute.js'
import homeRoute from './routes/homeRoute.js'
import productsRoute from './routes/productsRoute.js'
import realTimeRoute from './routes/realTimeRoute.js'
import userSessionRoute from './routes/userSessionRoute.js'

//cookieparser
app.use(cookieParser())

// data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// dirname
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '/public')))

// views

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')



// session
app.use(session({
    store: MongoStore.create({
        mongoUrl: db.URL
    }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// passport
initPassport()
app.use(passport.initialize())
app.use(passport.session())

// routes
app.use('/auth', authRoute)
app.use('/chat', chatRoute) // muestra el chat
app.use('/home', homeRoute) // muestra todos los productos
app.use('/api/carts', cartsRoute) // manejador de carritos
app.use('/user', userSessionRoute) // session manager 
app.use('/api/products', productsRoute) // manejador de productos
app.use('/realtimeproducts', realTimeRoute) // agregar y eliminar productos en tiempo real

// sockets
io.on('connection', async (socket) => {
    console.log('User connected')

    // PRODUCTS
    // mostramos todos los productos
    const products = await productService.getProductsService()
    socket.emit('products', products)

    socket.on('newProduct', async (data) => {
        console.log(data)
        const newProduct = new Product(data)
        productService.addProductService(newProduct)
        const products = await productService.getProductsService()
        io.sockets.emit('all-products', products)
    })

    socket.on('deleteProduct', async (data) => {
        await Product.deleteOne({ _id: data })
        const products = await productService.getProductsService()
        io.sockets.emit('all-products', products)
    })

    // CHAT
    const messages = await Message.find()
    socket.on('newMessage', async (data) => {
        const message = new Message(data)
        await message.save(data)
        io.sockets.emit('all-messages', messages)
    })
})

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
    db.connect()
})