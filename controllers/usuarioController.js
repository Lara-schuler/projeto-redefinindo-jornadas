const usuarioModel = require('../models/usuarioModel');
async function autenticar(req, res){
	const resp = await usuarioModel.autenticar(req.body.email, req.body.senha);
	if (resp && resp.length > 0) {
		req.session.user = resp[0];
		res.redirect('/');
	} else {
			res.redirect('/login');
	}
}




module.exports = {autenticar}