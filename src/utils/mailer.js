const nodemailer = require('nodemailer');
require('dotenv').config(); // Carregar variáveis de ambiente

// Configuração do transporte do Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Seu e-mail do Gmail
    pass: process.env.GMAIL_PASS   // Sua senha de aplicativo gerada
  }
});

// Função para enviar e-mail
const enviarEmail = (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,  // Seu e-mail do Gmail
    to,
    subject,
    html: htmlContent  // Garantir que o conteúdo seja HTML, e não texto simples
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
