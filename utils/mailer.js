const nodemailer = require('nodemailer');
require('dotenv').config(); // Carregar variáveis de ambiente

const transporter = nodemailer.createTransport({
    service: 'gmail', // Pode ser 'gmail' ou outro serviço de e-mail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('E-mail enviado:', info.response);
        })
        .catch(error => {
            console.log('Erro ao enviar e-mail:', error);
        });
};

module.exports = { enviarEmail };
