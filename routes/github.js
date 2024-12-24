import passport from 'passport'
import {Router} from 'express'
const router = new Router()

router.get('/', 
    passport.authenticate('github', {scope: ['user: email']})
)

router.get('/callback',
    // si falla la auth
    passport.authenticate('github', {failureRedirect: '/user/login'}),
    // si no falla
    (req, res) => {
        const userFound = req.user
        req.session.firstName = userFound.firstName || ' '
        req.session.email = userFound.email || ' '
        req.session.role = userFound.role || ' '
        res.redirect('/index')
    }
)

export default router