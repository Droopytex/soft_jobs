//invocación del JWT
const jwt = require("jsonwebtoken");

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");

const { getUser, agregarUser, verificarCredenciales } = require("./consultas");

app.listen(3000, console.log("SERVER ARRIBA!!!"));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const jwt_secret_key = "6K!U?ñx¡Yk7T7P7Q7pZ$Aa~Y2";

const verificarToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Se espera que el token esté en formato "Bearer <token>"
  if (!token)
    return res.status(401).send("Acceso denegado. No se proporcionó un token.");

  try {
    const verified = jwt.verify(token, jwt_secret_key); // Verifica el token
    req.user = verified; // Decodifica el token y lo añade al request
    next();
  } catch (error) {
    res.status(400).send("Token inválido.");
  }
};

// ruta GET
app.get("/usuarios", async (req, res) => {
  try {
    const users = await getUser();
    res.json(users);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);

    const token = jwt.sign({ email }, jwt_secret_key);
    res.json({ token });
  } catch (error) {
    console.log("Error en /login:", error);
    res.status(error.code || 500).send(error.message);
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    await agregarUser(req.body);
    res.status(201).send("Usuario agregado con exito ;)");
  } catch (error) {
    res
      .status(error.code || 500)
      .send(error.message || "Error al crear al usuario");
  }
});
