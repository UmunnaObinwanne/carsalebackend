import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()

const email = process.env.email
const pass = process.env.pass


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: email,
        pass: pass
    }
});

export default transporter;