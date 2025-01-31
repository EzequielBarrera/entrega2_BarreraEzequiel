import CartService from '../service/cartsService.js'
const cartService = new CartService()
import TicketService from '../service/ticketService.js'
const ticketService = new TicketService()
import sendEmail from './emailController.js'

class CartController {
    getCartsController = async (req, res) => {
        try {
            let carts = await cartService.getCartsService()
            req.status(200).send({ carts: carts })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    addCartController = async (req, res) => {
        try {
            let newCart = await cartService.addCartService()
            res.status(201).send({ message: 'Cart created successfully', cart: newCart })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    getCartByIdController = async (req, res) => {
        try {
            const id = req.params.cid
            const user = req.session.user
            const cart = await cartService.getCartByIdService(id)

            res.render('cartView', { cart: cart, user: user })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    addProductToCartController = async (req, res) => {
        try {
            const prodId = req.params.pid
            const cartId = req.params.cid
            const addProduct = await cartService.addProductToCartService(cartId, prodId)
            res.status(200).send({ message: 'Product added to cart', product: addProduct })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    updateQuantityController = async (req, res) => {
        try {
            const prodId = req.params.pid
            const cartId = req.params.cid
            const newQuantity = req.body
            const updateQuant = await cartService.updateCartService(cartId, prodId, newQuantity)
            res.status(200).send({ message: 'Quantity updated', updateQuant })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    updateCartController = async (req, res) => {
        try {
            const cid = req.params.cid
            await cartService.updateCartService(cid, null, req.body)
            const cartFound = await cartService.getCartByIdService(cid)
            res.status(201).send({ message: 'Cart updates successfully', cartFound })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    deleteFromCartController = async (req, res) => {
        try {
            const prodId = req.params.pid
            const cartId = req.params.cid
            const deleteProduct = await cartService.deteleProductFromCartService(cartId, prodId)
            res.status(200).send({ message: 'Product deleted from cart', product: deleteProduct })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    deleteCartController = async (req, res) => {
        try {
            const id = req.params.cid
            const deletedCart = await cartService.deleteCartService(id)
            res.status(200).send({ message: 'Cart deleted successfully', cart: deletedCart })
        } catch (error) {
            res.status(400).send({ error: error })
        }
    }

    generatePurchaseController = async (req, res) => {
        try {
            const cid = req.params.cid
            const user = req.session.user.email
            console.log(user)

            const newTicket = await cartService.generatePurchase(user, cid)
            console.log('newTicket:', newTicket)

            // Verifica si prodStock existe y es un array
            if (!Array.isArray(newTicket.prodStock)) {
                console.error("Error: prodStock no es un array", newTicket.prodStock)
                return res.status(400).send({ error: 'Stock inválido' })
            }

            await cartService.updateProductsService(cid, newTicket.noStock)
            await ticketService.updateStockService(newTicket.prodStock)

            const newTkt = {
                id: newTicket.ticket._id,
                amount: newTicket.ticket.amount,
                purchaser: newTicket.ticket.purchaser
            }
            console.log('newTkt:', newTkt)

            const email = {
                to: user,
                subject: 'Purchase',
                text: 'Gracias por su compra!',
                html: `
                <div class="container">
                    <h1> Resumen de compra </h1>
                        <div class="row">
                            <h4> Día: ${newTicket.ticket.purchase_datetime} </h4>
                            <h3> Código: ${newTicket.ticket.code} </h3>
                            <h3> Total: ${newTicket.ticket.amount} </h3>
                        </div>
                </div>
            `
            }
            console.log(email)

            await sendEmail(email)

            return res.status(200).send({ message: 'Purchased', newTkt })
        } catch (error) {
            res.status(500).send({ error: error })
        }
    }

    getPurchaseController = async (req, res) => {
        try {
            const ticket = await cartService.getPurchase()
            return res.status(200).send(ticket)
        } catch (error) {
            res.status(500).send({ error: error })
        }
    }

    deletePurchaseController = async (req, res) => {
        try {
            const deleted = await cartService.deletePurchase()
            return res.status(200).send(deleted)
        } catch (error) {
            res.status(500).send({ error: error })
        }
    }
}

export default CartController