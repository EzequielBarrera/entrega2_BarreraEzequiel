import passport from 'passport'
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import User from '../dao/models/userModel.js'
import { createHash, isValidPassword } from '../utils/bcrypt.js'
import fetch from 'node-fetch'
import Cart from '../dao/models/cartModel.js'
import config from '../config/config.js'


const GITHUB_CLIENT_ID = config.clientID
const GITHUB_CLIENT_SECRET = config.clientSecret

const LocalStrategy = local.Strategy
//const GitHubStrategy = github.Strategy

const initPassport = () => {
    passport.use('register',
        new LocalStrategy({ passReqToCallback: true, usernameField: 'email' },
            async (req, username, password, done) => {
                try {
                    let { email, firstName, lastName, age, password } = req.body
                    // buscamos si existe el user en la DB
                    let userFound = await User.findOne({ email: username })
                    if (userFound) {
                        console.log('User already exists')
                        return done(null, false)
                    }
                    const newCart = new Cart()
                    // si no existe lo creamos
                    let newUser = {
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        age: age,
                        password: createHash(password),
                        cart: await newCart.save(),

                    }

                    // seteamos el rol
                    if (newUser.email === 'adminCoder@coder.com' && newUser.password === 'admin1234') {
                        newUser.role = 'admin'
                    } else {
                        newUser.role = 'user'
                    }
                    console.log('User data during register:', newUser)
                    console.log('Password during register:', newUser?.password)
                    // guardamos
                    let userCreated = await User.create(newUser)
                    console.log({ message: 'User registered', userCreated })
                    done(null, userCreated)
                } catch (err) {
                    return done(err)
                }
            }
        )
    )

    passport.use('login',
        new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true },
            async (req, email, password, done) => {
                try {
                    // buscamos user
                    const userFound = await User.findOne({ email: email })
                    // si no existe
                    if (!userFound) {
                        console.log('User not found')
                        return done(null, false)
                    }
                    // validamos password
                    if (!isValidPassword(password, userFound.password)) {
                        console.log('Invalid password')
                        return done(null, false)
                    }

                    if (userFound.email == 'adminCoder@coder.com' && userFound.password == 'admin1234') {
                        req.session.admin = true
                    }
                    console.log('User data during login:', userFound)
                    console.log('Password during login:', userFound?.password)

                    // si sale todo bien
                    return done(null, userFound)
                } catch (err) {
                    return err
                }
            }
        )
    )


    passport.use('github',
        new GitHubStrategy({
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: 'http://localhost:8080/auth/github/callback'
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // config para recibir el mail
                    const res = await fetch('https://api.github.com/user/emails', {
                        headers: {
                            accept: 'application/vnd.github+json',
                            authorization: 'bearer' + accessToken,
                            'X-Github-Api-Version': '2022-11-28'
                        }
                    })

                    const resData = await res.json()
                    console.log({ resData: resData })
                    if (Array.isArray(resData)) {
                        const emailFound = resData.find((email) => email.verified === true);
                        console.log({ emailFound: emailFound })
                        if (emailFound) {
                            profile.email = emailFound.email;
                            let userFound = await User.findOne({ email: profile.email });
                            console.log({ userFound: userFound })

                            if (!userFound) {
                                const newUser = {
                                    email: profile.email,
                                    firstName: profile._json.name || profile._json.login || 'noname',
                                    lastName: 'nolast',
                                    password: 'nopass',
                                };
                                let userCreated = await User.create(newUser);
                                console.log('User registered');
                                return done(null, userCreated);
                            } else {
                                console.log('User already exists');
                                return done(null, userFound);
                            }
                        } else {
                            throw new Error('No verified email found');
                        }
                    } else {
                        throw new Error('Invalid response from GitHub API');
                    }
                } catch (err) {
                    console.log('Authentication error', + err)
                    return done(err)
                }
            }
        )
    )

    // se activa cuando se crea el user y lo serializa
    passport.serializeUser((user, done) => {
        done(null, user._id)
    }),
        // deserializa cuando nos querramos loguear y da paso a la estrategia de login
        passport.deserializeUser(async (id, done) => {
            let user = await User.findById(id)
            done(null, user)
        })
}

export default initPassport