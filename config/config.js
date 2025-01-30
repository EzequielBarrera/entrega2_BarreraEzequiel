import dotenv from 'dotenv'

dotenv.config()

export default {
    port: process.env.PORT,
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPass: process.env.ADMIN_PASS,
    gmailEmail: process.env.GMAIL_EMAIL,
    gmailPass: process.env.GMAIL_PASS,
    mongoURL: process.env.URL
}
