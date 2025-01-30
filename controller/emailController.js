import nodemailer from 'nodemailer'
import config from '../config/config.js'
const gmailEmail = config.gmailEmail
const gmailPass = config.gmailPass

const sendEmail = async (data) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: gmailEmail,
                pass: gmailPass
            }
        })

        const mailOptions = {
            from: 'Proyecto Coder' + gmailEmail,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        }

        let message = transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err)
            console.log('Message sent: %s', info.messageId)
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
        })

    } catch (error) {
        console.log('Error sending mail', err)
    }
}

export default sendEmail