import UserMethods from "../dao/methods/userMethods.js";
const userMethods = new UserMethods

class UserService {
    getUsersService = async () => {
        try {
            const users = await UserMethods.getUsersService()
            return users
        } catch (error) {
            throw new Error(error.message)
        }
    }

    getUserByIdService = async (id) => {
        try {
            const userFound = await userMethods.getUserByIdMethod(id)
            return userFound
        } catch (error) {
            throw new Error(error.message)
        }
    }

    addUserService = async (user) => {
        try {
            const newUser = await userMethods.addUserMethod(user)
            return newUser
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

export default UserService