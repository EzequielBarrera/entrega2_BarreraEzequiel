import TicketMethods from "../dao/methods/ticketMethods.js"
const ticketMethods = new TicketMethods()
import ProductsService from "./productService.js"
const productsService = new ProductsService()

class TicketService {
    createTicketService = async (newTicket) => {
        try {
            const newTkt = await TicketMethods.createTicketMethod(newTicket)
            return newTkt
        } catch (error) {
            console.log(error)
        }
    }

    getTicketsService = async () => {
        try {
            const tickets = await TicketMethods.getTicketsMethod()
            return tickets
        } catch (error) {
            console.log(error)
        }
    }

    updateStockService = async (stock) => {
        try {
            stock.map(async (product, index) => {
                await productsService.updateStockService(product.id, product.stock)
                console.log('Stock modificado')
            })
        } catch (error) {
            console.log(error)
        }
    }

    deletePurchaseService = async () => {
        try {
            const ticket = await TicketMethods.deletePurchaseMethod()
            return ticket
        } catch (error) {
            console.log(error)
        }
    }
}

export default TicketService