// se agregan las librerias a utilizar
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const {
  normalizarEmail,
  validarEmail,
  validarPassword,
  validarNombre,
} = require("./validaciones");
const { crearLimitador } = require("./limitador");

const app = express();
// Render (y otros proveedores) ubican un proxy delante: necesario para request.ip
app.set("trust proxy", 1);
app.use(express.json());

// Origenes permitidos para CORS.
// - Siempre se permiten los puertos comunes de desarrollo local (Parcel).
// - FRONTEND_URL permite agregar el/los dominios de produccion, separados por coma
//   (ej: FRONTEND_URL=https://recetario.onrender.com,https://www.recetario.onrender.com)
const origenesPermitidos = [
  "http://localhost:1234",
  "http://127.0.0.1:1234",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Sin "origin" = peticiones desde Postman, curl, apps moviles, etc. Se permiten.
      if (!origin) {
        return callback(null, true);
      }

      if (origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS bloqueado para origen no permitido: ${origin}`);
      // false = sin cabeceras CORS: el navegador bloquea la peticion sin generar un error 500
      return callback(null, false);
    },
  })
);

const pg = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 3000 por defecto: 5432 es el puerto de PostgreSQL y generaba confusion.
// En Render la variable PORT siempre esta definida.
const PORT = process.env.PORT || 3000;

// AJUSTE DE SEGURIDAD: se elimino console.log(DATABASE_URL) porque exponia
// las credenciales de Supabase en los logs de Render.

const limitadorLogin = crearLimitador({ maxIntentos: 10, ventanaMs: 15 * 60 * 1000 });

// Protege los endpoints administrativos con una clave en el header x-admin-key.
// Si ADMIN_API_KEY no esta configurada, los endpoints quedan deshabilitados.
function requiereAdmin(request, response, next) {
  const claveEsperada = process.env.ADMIN_API_KEY;
  if (!claveEsperada) {
    return response
      .status(403)
      .json({ error: "Endpoint administrativo deshabilitado" });
  }
  if (request.get("x-admin-key") !== claveEsperada) {
    return response.status(401).json({ error: "No autorizado" });
  }
  return next();
}

// Comprobante que la api esta conectada
app.get("/", (request, response) => {
  response.status(200).json({ message: "API funcionando" });
});

// Verificacion de salud: confirma tambien la conexion con la base de datos
app.get("/health", async (request, response) => {
  try {
    await pg.query("SELECT 1");
    return response.status(200).json({ status: "ok", db: "conectada" });
  } catch (error) {
    console.error("Health check fallido:", error.message);
    return response.status(503).json({ status: "error", db: "sin conexion" });
  }
});

// registrar
app.post("/sign-up", async (request, response) => {
  const { name, email, password } = request.body || {};

  const errorValidacion =
    validarNombre(name) || validarEmail(email) || validarPassword(password);
  if (errorValidacion) {
    return response.status(400).json({ error: errorValidacion });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await pg.query(
      `INSERT INTO public."usuarios" (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [name.trim(), normalizarEmail(email), hash]
    );

    if (nuevoUsuario.rows.length > 0) {
      return response.status(201).json({ message: "Usuario creado!" });
    }

    return response.status(500).json({ error: "Algo salio mal" });
  } catch (error) {
    // 23505 = unique_violation en PostgreSQL (correo ya registrado)
    if (error.code === "23505") {
      return response
        .status(409)
        .json({ error: "El correo ya esta registrado" });
    }
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// iniciar sesion
app.post("/sign-in", limitadorLogin, async (request, response) => {
  const { email, password } = request.body || {};

  if (validarEmail(email) || !password) {
    return response
      .status(400)
      .json({ error: "Correo y contrasena son obligatorios" });
  }

  try {
    const usuario = await pg.query(
      `SELECT id, password FROM public."usuarios" WHERE LOWER(email) = $1`,
      [normalizarEmail(email)]
    );

    // Mensaje unico para usuario inexistente y contrasena incorrecta:
    // evita revelar que correos estan registrados (enumeracion de usuarios).
    const credencialesInvalidas = () =>
      response.status(401).json({ error: "Correo o contrasena incorrectos" });

    if (usuario.rows.length === 0) {
      return credencialesInvalidas();
    }

    const validarContrasena = await bcrypt.compare(
      password,
      usuario.rows[0].password
    );

    if (!validarContrasena) {
      return credencialesInvalidas();
    }

    return response.status(200).json({ message: "Bienvenido!" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// consultar usuarios (todos, o filtrados por name/email, busqueda parcial)
// AJUSTE: requiere clave de administrador y nunca consulta la columna password.
app.get("/usuarios", requiereAdmin, async (request, response) => {
  const { name, email } = request.query;

  try {
    const condiciones = [];
    const valores = [];

    if (name) {
      valores.push(`%${name}%`);
      condiciones.push(`name ILIKE $${valores.length}`);
    }
    if (email) {
      valores.push(`%${email}%`);
      condiciones.push(`email ILIKE $${valores.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const usuarios = await pg.query(
      `SELECT id, name, email FROM public."usuarios" ${where}`,
      valores
    );

    if (usuarios.rows.length === 0) {
      return response.status(404).json({ error: "No hay usuarios" });
    }

    return response.status(200).json(usuarios.rows);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// eliminar usuario (solo administrador)
app.delete("/usuarios/:id", requiereAdmin, async (request, response) => {
  const { id } = request.params;

  if (!/^(\d+|[0-9a-f-]{36})$/i.test(id)) {
    return response.status(400).json({ error: "ID no valida" });
  }

  try {
    const resultado = await pg.query(
      `DELETE FROM public."usuarios" WHERE id = $1`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return response.status(404).json({ error: "Usuario no encontrado" });
    }

    return response.status(200).json({ message: "Usuario eliminado!" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Error en el servidor" });
  }
});

// Manejo de errores global (debe ir DESPUES de todas las rutas).
// Si el cuerpo de la peticion no es JSON valido, responde un 400 claro
// en vez de imprimir el stack trace completo en la terminal.
app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({
      error:
        "El cuerpo de la peticion no es un JSON valido. Revisa comillas dobles, comas y llaves.",
    });
  }
  console.error(error);
  return response.status(500).json({ error: "Error en el servidor" });
});

// Solo se levanta el servidor cuando el archivo se ejecuta directamente
// (node src/Services/api.js). Al importarlo desde las pruebas no abre el puerto.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log("Origenes permitidos (CORS):", origenesPermitidos.join(", "));

    // Calentamiento: abre la conexion con la base de datos al arrancar, para que
    // la primera peticion real no pague el costo de la conexion inicial (~500 ms).
    pg.query("SELECT 1")
      .then(() => console.log("Conexion con la base de datos lista"))
      .catch((error) =>
        console.error("No se pudo conectar con la base de datos:", error.message)
      );
  });
}

module.exports = { app, pg };