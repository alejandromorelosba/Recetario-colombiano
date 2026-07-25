// se agregan las librerias a utilizar
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PORT = process.env.PORT || 5432 ;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Comprobante que la api esta conectada 
app.get("/", (request, response) => {
  response.status(200).json({ message: "API funcionando" });
});

// registrar
app.post("/sign-up", async (request, response) => {
  const { name, email, password } = request.body;

  if (!name) {
    return response.status(400).json({ error: "El nombre no esta definido" });
  }

  if (!email) {
    return response.status(400).json({ error: "El correo no esta definido" });
  }

  if (!password) {
    return response
      .status(400)
      .json({ error: "La contrasena no esta definida" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await pg.query(
      `INSERT INTO public."usuarios" (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hash]
    );

    if (nuevoUsuario.rows.length > 0) {
      return response.status(201).json({ message: "Usuario creado!" });
    }

    return response.status(500).json({ error: "Algo salio mal" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// iniciar sesion
app.post("/sign-in", async (request, response) => {
  const { email, password } = request.body;

  if (!email) {
    return response.status(400).json({ error: "correo no valido" });
  }

  if (!password) {
    return response.status(400).json({ error: "contrasena incorrecta" });
  }

  try {
    const usuario = await pg.query(
      `SELECT * FROM public."usuarios" WHERE email = $1`,
      [email]
    );

    if (usuario.rows.length === 0) {
      return response.status(401).json({ error: "el usuario no existe" });
    }

    const validarContrasena = await bcrypt.compare(
      password,
      usuario.rows[0].password
    );

    if (!validarContrasena) {
      return response.status(401).json({ error: "Contrasena incorrecta" });
    }

    return response.status(200).json({ message: "Bienvenido!" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// consultar usuarios (todos, o filtrados por name/email, búsqueda parcial)
app.get("/usuarios", async (request, response) => {
  const { name, email } = request.query;

  try {
    let usuarios;

    if (name && email) {
      // filtra por ambos a la vez
      usuarios = await pg.query(
        `SELECT * FROM public."usuarios" WHERE name ILIKE $1 AND email ILIKE $2`,
        [`%${name}%`, `%${email}%`]
      );
    } else if (name) {
      usuarios = await pg.query(
        `SELECT * FROM public."usuarios" WHERE name ILIKE $1`,
        [`%${name}%`]
      );
    } else if (email) {
      usuarios = await pg.query(
        `SELECT * FROM public."usuarios" WHERE email ILIKE $1`,
        [`%${email}%`]
      );
    } else {
      // sin filtros -> devuelve todos los usuarios
      usuarios = await pg.query(`SELECT * FROM public."usuarios"`);
    }

    if (!usuarios || usuarios.rows.length === 0) {
      return response.status(404).json({ error: "No hay usuarios" });
    }

    const usuariosSinPassword = usuarios.rows.map((u) => {
      delete u.password;
      return u;
    });

    return response.status(200).json(usuariosSinPassword);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// eliminar usuario
app.delete("/usuarios/:id", async (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({ error: "ID no definida" });
  }

  try {
    await pg.query(`DELETE FROM public."usuarios" WHERE id = $1`, [id]);
    return response.status(200).json({ message: "Usuario eliminado!" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// comprobar si el servidor esta conectado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});