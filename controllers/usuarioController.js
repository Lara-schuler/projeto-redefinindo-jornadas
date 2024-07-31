const usuarioModel = require('../models/usuarioModel');

// Função de validação de entrada
function validarEntrada(email, senha) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
    }
    if (senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
}

async function autenticar(req, res) {
    const { email, senha } = req.body;
    try {
        validarEntrada(email, senha); // Chamada da função de validação
        const resp = await usuarioModel.autenticar(email, senha);
        if (resp && resp.length > 0) {
            req.session.user = resp[0];
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Controlador de login
async function login(req, res) {
    const { email, senha } = req.body;
    try {
        validarEntrada(email, senha); // Chamada da função de validação
        const usuario = await usuarioModel.autenticar(email, senha);
        if (usuario.length > 0) {
            req.session.usuario = usuario[0];
            res.status(200).json({ message: 'Login bem-sucedido', usuario: usuario[0] });
        } else {
            res.status(401).json({ message: 'Email ou senha incorretos' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Função para criar conta
async function criarConta(req, res) {
    const { email, senha } = req.body;
    try {
        validarEntrada(email, senha); // Chamada da função de validação
        await usuarioModel.criarConta(email, senha);
        res.redirect('/login');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Função para recuperação de senha
async function recuperarSenha(req, res) {
    const { email } = req.body;
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario) {
            // Lógica para enviar email de recuperação de senha
            res.status(200).json({ message: 'Email de recuperação enviado' });
        } else {
            res.status(404).json({ message: 'Email não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { autenticar, login, criarConta, recuperarSenha };