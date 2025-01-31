import Cart from '../dao/models/cartModel.js'
import CartsMethods from '../dao/methods/cartMethods.js'
const cartMethods = new CartsMethods()
import ProductService from './productService.js'
const productService = new ProductService()
import TicketService from './ticketService.js'
const ticketService = new TicketService()

class CartService {
    getCartsService = async () => {
        try {
            const carts = await cartMethods.getCartsMethods()
            return carts
        } catch (error) {
            throw new Error(error.message)
        }
    }

    addCartService = async () => {
        try {
            const cart = await cartMethods.addCartMethods()
            return cart
        } catch (error) {
            throw new Error(error.message)
        }
    }

    getCartByIdService = async (id) => {
        try {
            const cart = await Cart.findById(id).populate('products.product').lean()
            if (!cart) {
                throw new Error("Cart not found")
            }
            return cart
        } catch (error) {
            console.error("Error en getCartByIdService:", error.message)
            throw error
        }
    }

    addProductToCartService = async (cartId, prodId) => {
        try {
            let cart = await this.getCartByIdService(cartId)
            if (!cart) console.log('Cart not found')

            const productFound = cart.products.find(item => item.product.toString() === prodId)

            if (productFound) {
                await Cart.updateOne(
                    { _id: cartId, 'products.product': prodId },
                    { $inc: { 'products.$.quantity': 1 } }
                )
                return ({ message: 'Product quantity increased' })
            } else {
                const addProd = { $push: { products: { product: prodId, quantity: 1 } } }
                await Cart.updateOne({ _id: cartId }, addProd)
                return ({ message: 'Product added to cart' })
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    updateQuantityService = async (cartId, prodId, newQuantity) => {
        try {
            let cartFound = await this.getCartByIdService(cartId)

            if (cartFound) {
                const productFound = cartFound.products.find((product) => product.product.toString() === prodId)

                if (productFound) {
                    await Cart.updateOne(
                        { _id: cartId, 'products.product': prodId },
                        { $set: { 'products.$.quantity': newQuantity } }
                    )
                    return ({ message: 'Quantity updated successfully' })
                } else {
                    console.log('Product not found')
                }
            } else {
                console.log('Cart not found')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    updateCartService = async (cartId, prodId, userCart) => {
        try {
            if (prodId === null) {
                let cart = await cartMethods.getCartByIdMethods(cartId)
                let updateCart = cart.products = userCart.products
                await cart.save()
                console.log('Products in cart updated successfully')
                return updateCart
            } else {
                let cart = await cartMethods.getCartByIdMethods(cartId)

                let prodExists = cart.products.find((pid) => pid._id === prodId)
                if (prodExists) {
                    prodExists.quantity = userCart.quantity
                } else {
                    console.log("Product not found in cart")
                }
                await cart.save()
                return cart
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    updateProductsService = async (cartId, products) => {
        try {
            const cartFound = await cartMethods.updateProductsMethods(cartId, products)
            console.log('Products in cart updated successfully')
            return cartFound
        } catch (error) {
            throw new Error(error.message)
        }
    }

    deteleProductFromCartService = async (cartId, prodId) => {
        try {
            let cartFound = await this.getCartByIdService(cartId)

            if (cartFound) {
                const productFound = cartFound.products.find((product) => product.product.toString() === prodId)

                if (productFound) {
                    cartFound.products.splice(productFound, 1)
                    await cartFound.save()
                    return cartFound
                } else {
                    return false
                }
            } else {
                console.log('Cart not found')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    deleteCartService = async (id) => {
        try {
            const deletedCart = await cartMethods.deleteCartMethods(id)
            return deletedCart
        } catch (error) {
            throw new Error(error.message)
        }
    }

    generatePurchase = async (user, cartId) => {
        try {
            const cart = await cartMethods.getCartByIdMethods(cartId)
            if (cart) {
                const prodsIds = cart.products.map(product => product.product._id.toString())
                const prodsQuantity = cart.products.map(q => q.quantity)
                const prodsInfo = await productService.getProductsDataService(prodsIds)
                console.log(prodsIds, prodsQuantity, prodsInfo)
                let amount = 0
                let noStock = []
                let prodStock = []
                console.log(prodStock)

                prodsInfo.map((product, i) => {
                    if (prodsQuantity[i] > product.stock) {
                        noStock.push({ prodId: product._id, quantity: prodsQuantity[i] })
                    } else {
                        let newStock = product.stock - (prodsQuantity[i])
                        console.log('newStock:', newStock)

                        let prodPrice = product.price * (prodsQuantity[i])
                        console.log('Precio del producto:', product.price)
                        console.log('Cantidad del producto:', prodsQuantity[i])
                        amount += prodPrice

                        prodStock.push({ prodId: product._id, stock: newStock })
                        console.log('prodStock:', prodStock)
                    }
                })
                const ticket = await ticketService.createTicketService({
                    amount, purchaser: user
                })
                console.log(ticket)
                return {
                    ticket: ticket,
                    prodStock: prodStock,
                    noStock: noStock
                }
            } else {
                console.log('Cart not found')
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    getPurchase = async () => {
        try {
            const tickets = await ticketService.getTicketsService()
            return tickets
        } catch (error) {
            throw new Error(error.message)
        }
    }

    deletePurchase = async () => {
        try {
            const tickets = await ticketService.deletePurchaseService()
            return tickets
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

export default CartService