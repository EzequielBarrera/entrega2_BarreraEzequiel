const socket = io()

socket.on('getCart', (data) => {
    document.addEventListener('DOMContentLoaded', async () => {
        data = await getCart()
        return cartLink.href = `/api/carts/${data}`
    })
})

const cartLink = document.querySelector('.cart')

const getCart = async () => {
    try {
        const res = await fetch('/api/carts')
        if (!res.ok) throw new Error('Cart not found')

        const cart = await res.json()
        console.log(cart)
        return cart
    } catch (err) {
        console.log(err)
        return null
    }
}