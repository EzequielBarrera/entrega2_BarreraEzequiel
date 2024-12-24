import { Router } from 'express';
const router = new Router();
import User from '../dao/models/userModel.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';

function auth(req, res, next) {
    if (req.session.email === 'adminCoder@coder.com' && req.session.password === 'admin1234') {
        return next();
    }
    return res.send('An error occurred or you are not an admin');
}

// Registro
router.post('/register', passport.authenticate('register', { failureRedirect: '/auth/failedregistration' }), async (req, res) => {
    if (!req.user) {
        return res.status(400).json({ error: 'Something went wrong during registration' });
    }

    // Guarda el usuario en la sesión
    req.session.user = {
        _id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        age: req.user.age,
        password: req.user.password,
        cart: req.user.cart
    };

    return res.redirect('/user/login')
});

// Fallo en el registro
router.get('/failedregistration', async (req, res) => {
    return res.status(400).json({ error: 'Failed to register' });
});

// Login
router.post('/login', passport.authenticate('login', { failureRedirect: '/auth/failedlogin' }), async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ error: 'Invalid credentials' });  // Si las credenciales no son válidas, devuelve un error.
        }

        req.session.user = {
            _id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            age: req.user.age,
            password: req.user.password,
            cart: req.user.cart
        };

        let token = jwt.sign(req.session.user, 'tokenSecreto', { expiresIn: '2000s' });

        // Establecer la cookie
        res.cookie('cookieToken', token, { maxAge: 60 * 60 * 1000 });

        // Redirigir al usuario a la página de productos (index)
        return res.redirect('/index');  // Redirige aquí y detén el flujo para no enviar más respuestas.
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send({ error: error.message });  // En caso de error, envía un mensaje de error.
    }
});

// Fallo en el login
router.get('/failedlogin', async (req, res) => {
    return res.status(401).json({ error: 'Failed to login' });
});

// Ruta protegida solo para admin
router.get('/privado', auth, (req, res) => {
    res.send('Bienvenido admin!');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Failed to logout');
        res.redirect('/user/login');
    });
});

// Listar usuarios
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().lean().exec();
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router;