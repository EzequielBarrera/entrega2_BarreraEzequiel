import User from '../models/userModel.js'

class UserMethods {
    getUsersMethod = async () => {
        const users = await User.find()
        return users
    }

    getUserByIdMethod = async (id) => {
        const userFound = await User.findOne({ _id: id })
        return userFound
    }

    addUserMethod = async (user) => {
        const newUser = await User.create(user)
        return newUser
    }
}

export default UserMethods