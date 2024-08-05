const usuarioModel = require('../models/usuarioModel');
const { enviarEmail } = require('../utils/mailer');

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
            req.flash('message', 'Credenciais inválidas. Tente novamente.');
            res.redirect('/login');
        }
    } catch (error) {
        req.flash('message', error.message);
        res.redirect('/login');
    }
}

// Controlador de login
async function login(req, res) {
    const { email, senha } = req.body;
    try {
        validarEntrada(email, senha);
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
        req.flash('message', error.message);
        res.redirect('/criar-conta');
    }
}

async function recuperarSenha(req, res) {
    const { email } = req.body;
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
            // Gerar token e definir expiração
            const token = Math.random().toString(36).substr(2);
            const expiration = new Date(Date.now() + 3600000); // 1 hora

            // Atualizar banco de dados com o token e a expiração
            await usuarioModel.atualizarToken(email, token, expiration);

            // Enviar e-mail com o token
            const emailConteudo = `
                Seu token de recuperação é: ${token}.
                Acesse a página para verificar o token e redefinir sua senha.
            `;
            await enviarEmail(email, 'Recuperação de Senha', emailConteudo);

            // Redirecionar para a página de verificação
            res.redirect('/verificar-token?email=' + encodeURIComponent(email));
        } else {
            res.status(404).json({ message: 'Email não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


async function verificarToken(req, res) {
    const { email, token } = req.body;
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
            const usuarioInfo = usuario[0];
            const now = new Date();
            if (usuarioInfo.reset_token === token && new Date(usuarioInfo.token_expiration) > now) {
                // Redireciona para a página de redefinição de senha
                res.redirect('/redefinir-senha?email=' + encodeURIComponent(email));
            } else {
                res.status(400).json({ message: 'Token inválido ou expirado' });
            }
        } else {
            res.status(404).json({ message: 'Email não encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



async function redefinirSenha(req, res) {
    const { email, token, senha, confirmarSenha } = req.body;
    try {
        if (senha !== confirmarSenha) {
            throw new Error('As senhas não coincidem');
        }
        if (senha.length > 128) {
            throw new Error('A senha é muito longa');
        }

        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
            const usuarioInfo = usuario[0];
            const now = new Date();
            if (usuarioInfo.reset_token === token && new Date(usuarioInfo.token_expiration) > now) {
                // Atualiza a senha no banco de dados
                await usuarioModel.atualizarSenha(email, senha);
                // Limpar o token após redefinir a senha
                await usuarioModel.limparToken(email);
                res.redirect('/login');
            } else {
                throw new Error('Token inválido ou expirado');
            }
        } else {
            throw new Error('Email não encontrado');
        }
    } catch (error) {
        req.flash('message', error.message);
        res.redirect('/redefinir-senha');
    }
}



module.exports = { autenticar, login, criarConta, recuperarSenha, verificarToken, redefinirSenha };
