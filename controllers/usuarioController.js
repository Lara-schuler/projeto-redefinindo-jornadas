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
    const { emailOuTelefone, senha } = req.body;  // Ajuste para capturar um campo único
    try {
        if (!emailOuTelefone || !senha) {
            throw new Error('O campo de email ou telefone e a senha devem estar preenchidos');
        }
        const resp = await usuarioModel.autenticar(emailOuTelefone, senha);
        if (resp && resp.length > 0) {
            req.session.user = resp[0];  
            definirMensagem(req, 'success', 'Login realizado com sucesso!');
            res.redirect('/auth/apresentacao');
        } else {
            definirMensagem(req, 'error', 'Credenciais inválidas. Tente novamente.');
            res.redirect('/auth/login');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/auth/login');
    }
}

async function login(req, res) {
    const { emailOuTelefone, senha } = req.body;
  
    try {
        console.log('Dados recebidos no login:', { emailOuTelefone, senha });

        if (!emailOuTelefone) {
            definirMensagem(req, 'error', 'O campo de email ou telefone deve estar preenchido');
            return res.redirect('/auth/login');
        }
        if (!senha) {
            definirMensagem(req, 'error', 'A senha não pode estar vazia');
            return res.redirect('/auth/login');
        }
  
        const usuario = await usuarioModel.autenticar(emailOuTelefone, senha);
        console.log('Resultado da autenticação:', usuario);

        if (usuario.length > 0) {
            req.session.user = usuario[0];
            console.log("Usuário autenticado com sucesso:", req.session.user);
  
            // Buscar o id_usuario correspondente ao id_pessoa
            const usuarioInfo = await usuarioModel.obterUsuarioPorId(req.session.user.id_pessoa);
            console.log("Informações do usuário:", usuarioInfo);

            if (!usuarioInfo) {
                definirMensagem(req, 'error', 'Usuário não encontrado');
                return res.redirect('/auth/login');
            }

            req.session.user.id_usuario = usuarioInfo.id_usuario;
  
            // Verifica o perfil do usuário
            const perfil = await usuarioModel.verificarPerfil(req.session.user.id_usuario);
            console.log("Perfil do usuário verificado:", perfil);

             // Definir tipo_perfil e status_perfil na sessão do usuário
             req.session.user.tipo_perfil = perfil.tipo_perfil;
             req.session.user.status_perfil = perfil.status_perfil;
  
            // Lógica de redirecionamento
            if (perfil.status_perfil === 'criado') {
                // Se o perfil foi criado, redireciona conforme o tipo de perfil
                definirMensagem(req, 'success', 'Login bem-sucedido!');
                if (perfil.tipo_perfil === 'psr') {
                    return res.redirect('/psr/feed-psr');
                } else if (perfil.tipo_perfil === 'voluntario') {
                    return res.redirect('/parceiro/feed-parceiro');
                } else if (perfil.tipo_perfil === 'admin') {
                    return res.redirect('/admin/feed-admin');
                } else if (perfil.tipo_perfil === 'instituicao_publica') {
                    return res.redirect('/instituicao_publica/feed-instituicao_publica');
                } else if (perfil.tipo_perfil === 'ong') {
                    return res.redirect('/ong/feed-ong');
                } else if (perfil.tipo_perfil === 'empresa') {
                    return res.redirect('/parceiro/feed-parceiro');
                }
            } else {
                // Se o perfil não foi criado, redireciona para a tela de apresentação
                definirMensagem(req, 'success', 'Login bem-sucedido, por favor complete seu perfil');
                return res.redirect('/auth/apresentacao');
            }
        } else {
            definirMensagem(req, 'error', 'Email/Telefone ou senha incorretos');
            return res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Erro durante o login:', error);
        definirMensagem(req, 'error', error.message);
        return res.redirect('/auth/login');
    }
};


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
            res.redirect('/auth/criar-conta');
            return;
        }
        
        if (telefoneExists.length > 0) {
            definirMensagem(req, 'error', 'Telefone já está em uso.');
            res.redirect('/auth/criar-conta');
            return;
        }

        await usuarioModel.criarConta(email, telefone, senha);
        definirMensagem(req, 'success', 'Conta criada com sucesso.');
        res.redirect('/auth/login');
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/auth/criar-conta');
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
            res.redirect('/auth/verificar-token?email=' + encodeURIComponent(email));
        } else {
            definirMensagem(req, 'error', 'Email não encontrado');
            res.redirect('/auth/recuperar-senha');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/auth/recuperar-senha');
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
                res.redirect('/auth/verificar-token?email=' + encodeURIComponent(email));
            }
        } else {
            definirMensagem(req, 'error', 'Email não encontrado');
            res.redirect('/auth/verificar-token');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/auth/verificar-token');
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
                res.redirect('/auth/login');
            } else {
                throw new Error('Token inválido ou expirado');
            }
        } else {
            throw new Error('Email não encontrado');
        }
    } catch (error) {
        definirMensagem(req, 'error', error.message);
        res.redirect('/auth/redefinir-senha?email=' + encodeURIComponent(email) + '&token=' + encodeURIComponent(token));
    }
}

async function criarPerfil(req, res) {
    try {
        const tipoPerfil = req.body.tipo_perfil;
        const pessoaId = req.session.user ? req.session.user.id_pessoa : undefined;

        console.log('ID da pessoa na sessão:', pessoaId);
        console.log('Tipo de perfil recebido:', tipoPerfil);

        if (!pessoaId) {
            throw new Error('ID da pessoa não está definido na sessão.');
        }
        if (!tipoPerfil) {
            throw new Error('Tipo de perfil não está definido.');
        }

        const usuario = await usuarioModel.obterUsuarioPorId(pessoaId);
        
        console.log('Resultado da busca do usuário:', usuario);

        if (usuario !== null && typeof usuario === 'object') {
            console.log('Usuário encontrado:', usuario);
            
            // Atualize o tipo de perfil
            await usuarioModel.atualizarTipoPerfil(usuario.id_usuario, tipoPerfil);

            // Redirecionar com base no tipo de perfil selecionado
            switch (tipoPerfil) {
                case 'psr':
                    res.redirect('/psr/criar-psr');  // Redireciona para a criação de perfil PSR
                    break;
                case 'instituicao_publica':
                    res.redirect('/instituicao/criar');  // Ajuste para a rota da instituição
                    break;
                case 'ong':
                    res.redirect('/ong/criar-ong');  // Ajuste para a rota da ONG
                    break;
                case 'empresa':
                    res.redirect('/empresa/-empresa');  // Ajuste para a rota da empresa
                    break;
                case 'voluntario':
                    res.redirect('/voluntario/criar-voluntario');  // Ajuste para a rota do voluntário
                    break;
                case 'administrador':
                    res.redirect('/admin/criar');  // Ajuste para a rota do administrador
                    break;
                default:
                    res.redirect('/auth/apresentacao');  // Rota padrão caso algo não seja esperado
            }
        } else {
            console.error('Usuário não encontrado com ID:', pessoaId);
            res.status(404).json({ erro: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('Erro na criação de perfil:', error);
        res.status(500).json({ erro: 'Erro na criação de perfil: ' + error.message });
    }
}


module.exports = { autenticar, login, criarConta, recuperarSenha, verificarToken, redefinirSenha, criarPerfil };