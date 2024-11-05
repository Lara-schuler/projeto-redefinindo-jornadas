require("dotenv").config();
const mysql = require("mysql2/promise");

async function connect() {
  if (global.connection && global.connection.state !== 'disconnected')
    return global.connection;

  const connection = await mysql.createConnection({
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  });

  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function query(sql, params) {
  const conn = await connect();
  const [rows] = await conn.query(sql, params);
  console.log('Resultado da query:', rows);
  return rows;
}

module.exports = { query };
