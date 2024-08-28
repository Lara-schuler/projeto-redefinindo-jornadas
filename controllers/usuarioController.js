const usuarioModel = require('../models/usuarioModel');
const { enviarEmail } = require('../utils/mailer');
const crypto = require('crypto');

function validarEntrada(email, telefone, senha) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneRegex = /^\d{10,11}$/; // Ajuste conforme o formato necessário para o telefone

    if (!email && !telefone) {
        throw new Error('O campo de email ou telefone deve estar preenchido');
    }
    if (email && !emailRegex.test(email) && telefone) {
        throw new Error('Formato de email inválido');
    }
    if (email && email.includes(" ")) {
        throw new Error('O email não deve conter espaços em branco');
    }
    if (email && email.length > 254) {
        throw new Error('O email é muito longo');
    }
    if (telefone && !telefoneRegex.test(telefone)) {
        throw new Error('Formato de telefone inválido');
    }
    if (senha) {
        if (senha.length > 128) {
            throw new Error('A senha é muito longa');
        }
        if (senha.length < 6) {
            throw new Error('A senha é muito curta');
        }
    }
}


// Função para definir o tipo de mensagem
function definirMensagem(req, tipo, texto) {
    req.flash(tipo, texto);
}

async function autenticar(req, res) {
    const { email, telefone, senha } = req.body;
    try {
        validarEntrada(email, telefone, senha);
        // Verifique se pelo menos um dos valores email ou telefone está definido
        if (!email && !telefone) {
            throw new Error('O campo de email ou telefone deve estar preenchido');
        }
        const resp = await usuarioModel.autenticar(email || telefone, senha);
        if (resp && resp.length > 0) {
            req.session.user = resp[0];
            definirMensagem(req, 'success', 'Login realizado com sucesso!');
            res.redirect('/login/apresentacao');
        } else {
            definirMensagem(req, 'error', 'Credenciais inválidas. Tente novamente.');
            res.redirect('/login');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/login');
    }
}


// Controlador de login
async function login(req, res) {
    const { email, telefone, senha } = req.body;
    console.log('Email:', email);
    console.log('Telefone:', telefone);
    console.log('Senha:', senha);

    try {
        if (!email && !telefone) {
            throw new Error('O campo de email ou telefone deve estar preenchido');
        }
        if (!senha) {
            throw new Error('A senha não pode estar vazia');
        }
        
        const usuario = await usuarioModel.autenticar(email || telefone, senha);
        console.log('Resultado da autenticação:', usuario);
        
        if (usuario.length > 0) {
            req.session.usuario = usuario[0];
            res.status(200).json({ message: 'Login bem-sucedido', usuario: usuario[0] });
        } else {
            res.status(401).json({ message: 'Email/Telefone ou senha incorretos' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


// Função de validação específica para criação de conta
function validarEntradaCriarConta(email, telefone, senha, confirmarSenha) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefoneRegex = /^\d{10,11}$/;

    if (!email && !telefone) {
        throw new Error('O campo de email ou telefone deve estar preenchido');
    }
    if (email && !emailRegex.test(email)) {
        throw new Error('Formato de email inválido');
    }
    if (email && email.includes(" ")) {
        throw new Error('O email não deve conter espaços em branco');
    }
    if (email && email.length > 254) {
        throw new Error('O email é muito longo');
    }
    if (telefone && !telefoneRegex.test(telefone)) {
        throw new Error('Formato de telefone inválido');
    }
    if (!senha) {
        throw new Error('O campo de senha não pode estar vazio');
    }
    if (senha.length > 128) {
        throw new Error('A senha é muito longa');
    }
    if (senha.length < 6) {
        throw new Error('A senha é muito curta');
    }
    if (senha !== confirmarSenha) {
        throw new Error('As senhas não coincidem');
    }
}

async function criarConta(req, res) {
    const { email, telefone, senha, confirmarSenha } = req.body;
    try {
        validarEntradaCriarConta(email, telefone, senha, confirmarSenha);
        const emailExists = email ? await usuarioModel.buscarPorEmail(email) : [];
        const telefoneExists = telefone ? await usuarioModel.buscarPorTelefone(telefone) : [];
        
        if (emailExists.length > 0) {
            definirMensagem(req, 'error', 'Email já está em uso.');
            res.redirect('/criar-conta');
            return;
        }
        
        if (telefoneExists.length > 0) {
            definirMensagem(req, 'error', 'Telefone já está em uso.');
            res.redirect('/criar-conta');
            return;
        }

        await usuarioModel.criarConta(email, telefone, senha);
        definirMensagem(req, 'success', 'Conta criada com sucesso.');
        res.redirect('/login');
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/criar-conta');
    }
}

async function recuperarSenha(req, res) {
    const { email } = req.body;
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
            const token = crypto.randomBytes(32).toString('hex'); // Ajustado para usar crypto
            const expiration = new Date(Date.now() + 3600000); // 1 hora

            await usuarioModel.atualizarToken(email, token, expiration);

            const emailConteudo = `
                Seu token de recuperação é: ${token}.
                Acesse a página para verificar o token e redefinir sua senha.
            `;
            await enviarEmail(email, 'Recuperação de Senha', emailConteudo);

            definirMensagem(req, 'success', 'Token de recuperação enviado para o seu e-mail.');
            res.redirect('/verificar-token?email=' + encodeURIComponent(email));
        } else {
            definirMensagem(req, 'error', 'Email não encontrado');
            res.redirect('/recuperar-senha');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/recuperar-senha');
    }
}

async function verificarToken(req, res) {
    const { email, token } = req.body;
    console.log('Email recebido:', email);
    console.log('Token recebido:', token);
    try {
        const usuario = await usuarioModel.buscarPorEmail(email);
        console.log('Usuário encontrado:', usuario);
        if (usuario.length > 0) {
            const usuarioInfo = usuario[0];
            console.log('Token do usuário:', usuarioInfo.reset_token);
            console.log('Expiração do token:', usuarioInfo.token_expiration);
            const now = new Date();
            if (usuarioInfo.reset_token === token && new Date(usuarioInfo.token_expiration) > now) {
                res.render('usuarios/redefinir-senha', {
                    layout: './layouts/default/redefinir-senha',
                    title: 'Redefinir Senha',
                    email,
                    token
                });
            } else {
                definirMensagem(req, 'error', 'Token inválido ou expirado');
                res.redirect('/verificar-token?email=' + encodeURIComponent(email));
            }
        } else {
            definirMensagem(req, 'error', 'Email não encontrado');
            res.redirect('/verificar-token');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/verificar-token');
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
        if (senha.length < 6) {
            throw new Error('A senha é muito curta');
        }
        const usuario = await usuarioModel.buscarPorEmail(email);
        if (usuario.length > 0) {
            const usuarioInfo = usuario[0];
            const now = new Date();
            if (usuarioInfo.reset_token === token && new Date(usuarioInfo.token_expiration) > now) {
                await usuarioModel.atualizarSenha(email, senha);
                await usuarioModel.limparToken(email);
                definirMensagem(req, 'success', 'Senha redefinida com sucesso.');
                res.redirect('/login');
            } else {
                throw new Error('Token inválido ou expirado');
            }
        } else {
            throw new Error('Email não encontrado');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/redefinir-senha?email=' + encodeURIComponent(email) + '&token=' + encodeURIComponent(token));
    }
}

async function criarPerfil(req, res) {
    const { tipoPerfil } = req.body; // Receba o tipo de perfil do formulário
    const usuarioId = req.session.user.id; // Obtenha o ID do usuário da sessão

    // Defina uma lista de tipos de perfil válidos
    const tiposValidos = ['psr', 'instituicao_publica', 'ong', 'pessoa_fisica', 'empresa', 'administrador'];

    try {
        // Validação do tipo de perfil
        if (!tipoPerfil) {
            throw new Error('O tipo de perfil deve ser selecionado.');
        }
        if (!tiposValidos.includes(tipoPerfil)) {
            throw new Error('Tipo de perfil inválido.');
        }

        // Armazenar o tipo de perfil no banco de dados
        await usuarioModel.salvarTipoPerfil(usuarioId, tipoPerfil);

        // Armazenar o tipo de perfil na sessão para fins de controle de acesso
        req.session.user.tipoPerfil = tipoPerfil;

        // Definir mensagem de sucesso
        definirMensagem(req, 'success', 'Perfil criado com sucesso.');

        // Redirecionar para a página desejada após a criação do perfil
        res.redirect('/home');
    } catch (error) {
        // Definir mensagem de erro e redirecionar de volta para o formulário
        definirMensagem(req, 'error', error.message);
        res.redirect('/criar-perfil');
    }
}



module.exports = { autenticar, login, criarConta, recuperarSenha, verificarToken, redefinirSenha, criarPerfil };
