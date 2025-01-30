import Cart from "../models/cartModel.js";

class CartsMethods {
    getCartsMethods = async () => {
        const carts = await Cart.find({}).lean()
        return carts
    }

    addCartMethods = async () => {
        const newCart = new Cart()
        return newCart.save()
    }

    getCartByIdMethods = async (id) => {
        const cartFound = await Cart.findOne({ _id: id }).lean()
        return cartFound
    }

    updateCartMethods = async (id) => {
        await Cart.updateOne({ _id: id }, { products: [] })
    }

    updateProductsMethods = async (id, products) => {
        await Cart.updateOne({ _id: id }, { products })
    }

    deleteCartMethods = async (id) => {
        const deletedCart = await Cart.deleteOne({ _id: id })
        return deletedCart
    }
}

export default CartsMethods
