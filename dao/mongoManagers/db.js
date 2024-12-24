import mongoose from "mongoose"
const URL = 'mongodb+srv://barreraezequiel281:AxuUfmgfFY3ZWYgR@ecommerce.9ltjf.mongodb.net/Ecommerce'

export default {
    URL,
    connect: () => {
        return mongoose.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true })
            .then((connect) => {
                console.log('Connected to DB')
            })
            .catch((err) => console.log(err))
    }
}