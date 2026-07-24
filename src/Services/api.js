// se agregan las librerias a utilizar 
require("dotenv").config();

const express = require ("express")
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { Pool } = require("pg")

const app = express();
app.use(express.json());
app.use(cors("*"));

const pg = new Pool({
    connectionString: process.env.DATABASE_URL
}) 

const PORT = process.env.PORT || 8080;


//comprar si el servidor esta conectado
app.listen(PORT,() =>{
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// registrar 
app.post("/sign-up", async (request, response) => {
  const { name, email, passaword } = request.body;

    if (!name) {
    return response.status(400).json({ error: "El nombre no esta definido" });
  }

  if (!email) {
    return response.status(400).json({ error: "El correo no esta definido" });
  }

  if (!passaword) {
    return response
      .status(400)
      .json({ error: "La contrasena no esta definida" });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(contrasena, salt);

  const nuevoUsuario = await pg.query(
    `INSERT INTO public."usuarios" (name, email, password) VALUES ($1, $2, $3, ) RETURNING *`,
    [nombre, edad, correo, hash],
  );

  if (nuevoUsuario.rows.length > 0) {
    return response.status(201).json({ message: "Usuario creado!" });
  }

  return response.status(500).json({ error: "Algo salio mal" });
});

const nuevoUsario = await pg.query(
    `INSERT INTO public."usuarios" (name, email, passaword) VALUES ($1, $2, $3, ) RETURNING *`,
    [name, email, hash]
)

if (nuevoUsario.rows.length > 0){
    return express.response.status(201).json({massage: "Usuario creado!"})
}
return response.status(500).json({error: "algo salio mal"});


//iniciar
app.post("/sing-in", async(request, response) =>{
    const { email, passaword} = request.body;

    if(!email) {
        return response.status(400).json({error: "correo no valido"})
    }

    if(!passaword) {
        return response.status(400).json({error: "contraseña incorreta"})
    }


    const usuario = await pg.query(
        `SELECT * FROM public."usuarios" WHERE correo = $1`,
        [email],
    );

    if (usuario.rows.length === 0){
        return response.status(401).json({error:"el usuario no existe"})
    }

const validarContrasña = await bcrypt.compare(
    passaword,
    usuario.rows[0].passaword, 
);

    if (!validarContrasena) {
        return response.status(401).json({ error: "Contrasena incorrecta" });
    }
        return response.status(200).json({ message: "Bienvenido!" });
});

//
app.get ("/usuarios", async (request, response) => {
    const {name, email} = request.query;

    if(!name && !email){
        return response.status(400).json({error: "no has enviado nombre ni correo"})
    }

    if (nombre) {
    usuarios = await pg.query(
        `SELECT * FROM public."usuarios" WHERE name = $1`,
        [name],
    );
    } else if (email) {
        usuarios = await PaymentRequest.queryS(
            `SELECT * FROM public."usuarios" WHERE email = $1`,
            [email]
        );
    } else {
    return response.status(400).json({ error: "Has enviado un       incorrecto" });
    }

  if (!usuarios) {
    return response.status(400).json({ error: "No hay usuarios" });
  }

  if (usuarios.rows.length === 0) {
    return response.status(400).json({ error: "No hay usuarios" });
  }

  usuarios = usuarios.rows.filter((values) => {
    delete values.passaword;

    return values;
  });

  return response.status(200).json(usuarios || []);

})

app.delete("/usuarios/:id", async (request, response) => {
  const { id } = request.params;

  if (!id) {
    return response.status(400).json({ error: "ID no definida" });
  }

  await pg.query(`DELETE FROM public."usuarios" WHERE id = $1`, [id]);

  return response.status(200).json({ message: "Usuario eliminado!" });
});

app.listen(8080, () => {
  console.log("Servidor iniciado en el puerto 8080");
});