import nodemailer from 'nodemailer'
import config from '../config/config.js'
const gmailEmail = config.gmailEmail
const gmailPass = config.gmailPass

const sendEmail = async (data) => {
    try {
        if (!data || !data.to || !data.subject || !data.text) {
            throw new Error("Faltan datos en el email")
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: gmailEmail,
                pass: gmailPass
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const mailOptions = {
            from: `Proyecto Coder <${gmailEmail}>`, // Arregla el formato del "from"
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html || ""
        }

        console.log("Enviando correo con los siguientes datos:", mailOptions)

        let info = await transporter.sendMail(mailOptions)
        console.log('Mensaje enviado: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

        return info
    } catch (error) {
        console.error('Error enviando correo:', error.message)
        throw error
    }
}

export default sendEmail