import UserService from '../service/userService.js'
const userService = new UserService()
import UserDTO from '../dao/DTO/userdto.js'
import jwt from 'jsonwebtoken'

class SessionController {
    getUsersController = async (req, res) => {
        try {
            const users = await userService.getUsersService()
            res.status(200).send({ users: users })
        } catch (error) {
            res.status(404).send({ error: error })
        }
    }

    register = (req, res) => {
        try {
            if (!req.user) return res.status(400).send({ error: 'Error registering' })

            req.session.user = { _id: req.user._id, email: req.user.email, firstName: req.user.firstName, lastName: req.user.lastName, password: req.session.password, age: req.user.age, cart: req.user.cart }

            return res.status(200).redirect('/user/login')
        } catch (error) {
            return res.status(500).send({ error: error.message })
        }
    }

    failedRegister = (req, res) => {
        return res.status(400).send({ error: 'Fail to register' })
    }

    login = (req, res) => {
        try {
            if (!req.user) return res.status(401).send({ error: 'Invalid credentials' })

            req.session.user = {
                _id: req.user._id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                password: req.user.password,
                age: req.user.age,
                cart: req.user.cart,
            }
            console.log(req.session.user)

            try {
                let token = jwt.sign(req.session.user, 'tokenSecreto', { expiresIn: '2000s' })
                console.log({ token, message: 'User logged in' })
                return res.redirect('/home')
            } catch (tokenError) {
                return next(tokenError)
            }
        } catch (error) {
            return res.status(500).send({ error: error.message })
        }
    }

    failLogin = (req, res) => {
        return res.status(400).send({ error: 'Fail to login' })
    }

    logout = (req, res) => {
        req.session.destroy((err) => {
            if (err) return res.status(500).send({ error: 'Logout failed', detail: err })
            console.log('Logged out')
            res.redirect('/user/login')
        })
    }

    isAdmin = (req, res) => {
        res.send('Bienvenido admin!')
    }

    getCurrentSession = (req, res) => {
        const user = req.session.user
        const showUser = new UserDTO(user)
        return res.status(200).send({ user: showUser })
    }
}

export default SessionController