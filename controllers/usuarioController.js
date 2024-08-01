const usuarioModel = require('../models/usuarioModel');

// Função de validação de entrada
function validarEntrada(email, senha) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!email) {
        throw new Error('O campo de email não pode estar vazio');
    }
    if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
    }
    if (email.includes(" ")) {
        throw new Error('O email não deve conter espaços em branco');
    }
    if (email.length > 254) {
        throw new Error('O email é muito longo');
    }

    if (!senha) {
        throw new Error('O campo de senha não pode estar vazio');
    }
    /*if (!senhaRegex.test(senha)) {
        throw new Error('A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial');
    }*/
    if (senha.length > 128) {
        throw new Error('A senha é muito longa');
    }
}

async function autenticar(req, res) {
    const { email, senha } = req.body;
    try {
        validarEntrada(email, senha);
        const resp = await usuarioModel.autenticar(email, senha);
        if (resp && resp.length > 0) {
            req.session.user = resp[0];
            res.redirect('/');
        } else {
            req.flash('message', 'Credenciais inválidas. Tente novamente.'); // Adiciona mensagem à sessão
            res.redirect('/login');
        }
    } catch (error) {
        req.flash('message', error.message); // Adiciona mensagem à sessão
        res.redirect('/login');
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


// Função de validação específica para criação de conta
function validarEntradaCriarConta(email, senha, confirmarSenha) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!email) {
        throw new Error('O campo de email não pode estar vazio');
    }
    if (!emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
    }
    if (email.includes(" ")) {
        throw new Error('O email não deve conter espaços em branco');
    }
    if (email.length > 254) {
        throw new Error('O email é muito longo');
    }

    if (!senha) {
        throw new Error('O campo de senha não pode estar vazio');
    }
    /*if (!senhaRegex.test(senha)) {
        throw new Error('A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial');
    }*/
    if (senha.length > 128) {
        throw new Error('A senha é muito longa');
    }

    if (senha !== confirmarSenha) {
        throw new Error('As senhas não coincidem');
    }
}

async function criarConta(req, res) {
    const { email, senha, confirmarSenha } = req.body;
    try {
        validarEntradaCriarConta(email, senha, confirmarSenha);
        const emailExists = await usuarioModel.buscarPorEmail(email);
        if (emailExists.length > 0) {
            req.flash('message', 'Email já está em uso.');
            res.redirect('/criar-conta');
            return;
        }

        await usuarioModel.criarConta(email, senha);
        res.redirect('/login');
    } catch (error) {
        req.flash('message', error.message); // Adiciona mensagem à sessão
        res.redirect('/criar-conta');
    }
}


async function recuperarSenha(req, res) {
    const { email } = req.body;
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
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
