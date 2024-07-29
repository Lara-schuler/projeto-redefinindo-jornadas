class Usuario {


	static async autenticar(email, senha){
		const md5 = require('md5');
		const Database= require('./Database');
		let sql=`SELECT p.* FROM pessoa
		JOIN usuario u ON u.pessoa_id_pessoa=p.id_pessoa 
		WHERE p.email ='${email}' AND u.senha ='${md5(senha)}'`;
		console.log(sql);
		return await Database.query(sql);
	}
}


module.exports = Usuario;