const nodemailer = require('nodemailer');
require('dotenv').config(); // Carregar variáveis de ambiente

// Configuração do transporte do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

// Função para enviar e-mail
const enviarEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.MAILTRAP_USER,
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
