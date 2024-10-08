const bcrypt = require("bcryptjs");

const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "softjobs",
});

/* traer usuarios */
const getUser = async () => {
  const { rows: usuarios } = await pool.query("SELECT * FROM usuarios");
  return usuarios;
};

/* agregar usuarios */
const agregarUser = async ({ email, lenguage, password, rol }) => {
  const salt = await bcrypt.genSalt(10); // Genera un "salt"
  const hashedPassword = await bcrypt.hash(password, salt); // Encripta la contraseña
  const consulta =
    "INSERT INTO usuarios(id, email, password, rol, lenguage) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *";
  const values = [email, hashedPassword, rol, lenguage];
  await pool.query(consulta, values);
};

/*const agregarUser = async ({ email, lenguage, password, rol }) => {
  //console.log(email, lenguage, password, rol);
  const consulta =
    "INSERT INTO usuarios(id, email, password, rol, lenguage) VALUES ( DEFAULT,$1, $2, $3, $4) RETURNING * ";
  const values = [email, password, rol, lenguage];
  await pool.query(consulta, values);
};*/

/* verificación de usuarios */
const verificarCredenciales = async (email, password) => {
  const consulta = "SELECT * FROM usuarios WHERE email = $1";
  const values = [email];
  const { rows, rowCount } = await pool.query(consulta, values);
  if (!rowCount) {
    console.log("Usuario no encontrado:", email);
    throw { code: 404, message: "Credenciales incorrectas" };
  }

  const user = rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw { code: 401, message: "Contraseña incorrecta" };
};

/*const verificarCredenciales = async (email, password) => {
  const consulta = "SELECT * FROM usuarios WHERE email = $1 AND password = $2";
  const values = [email, password];
  const { rowCount } = await pool.query(consulta, values);
  if (!rowCount)
    throw {
      code: 404,
      message: "No se encontró ningún usuario con estas credenciales",
    };
};*/

module.exports = { getUser, agregarUser, verificarCredenciales };
