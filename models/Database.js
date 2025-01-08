require('dotenv').config();
const mysql = require('mysql2/promise');

async function connect() {
  if (global.connection && global.connection.state !== 'disconnected') return global.connection;

  const connection = await mysql.createConnection({
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });

  console.log('Conectou no MySQL!');
  global.connection = connection;
  return connection;
}

async function beginTransaction() {
  const conn = await connect();
  await conn.beginTransaction();
  return conn;
}

async function commitTransaction(conn) {
  if (conn) {
    await conn.commit();
    console.log('Transação confirmada.');
  }
}

async function rollbackTransaction(conn) {
  if (conn) {
    await conn.rollback();
    console.log('Transação revertida.');
  }
}

async function query(sql, params, conn) {
  const connection = conn || await connect(); // Conexão reutilizada ou nova
  const [rows] = await connection.query(sql, params); // Execução da query e destruição para pegar as linhas
  // console.log('Resultado da query:', rows);  // Log das linhas retornadas
  return rows; // Retorna as linhas para o chamador
}

module.exports = {
  query, beginTransaction, commitTransaction, rollbackTransaction,
};
