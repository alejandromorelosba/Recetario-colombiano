const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ADMIN_API_KEY = "clave-de-prueba";
process.env.FRONTEND_URL = "https://recetario.example.com";

const { app, pg } = require("../src/Services/api");
const bcrypt = require("bcryptjs");

let servidor;
let base;

test.before(async () => {
    await new Promise((resolve) => {
    servidor = app.listen(0, () => {
    base = `http://127.0.0.1:${servidor.address().port}`;
    resolve();
    });
    });
});

test.after(() => servidor.close());

const post = (ruta, cuerpo, headers = {}) =>
fetch(base + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(cuerpo),
});

test("GET / confirma que la API funciona", async () => {
    const r = await fetch(base + "/");
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { message: "API funcionando" });
});

test("GET /health responde 503 si la base de datos no responde", async () => {
    pg.query = async () => { throw new Error("sin conexion"); };
    const r = await fetch(base + "/health");
    assert.equal(r.status, 503);
});

test("GET /health responde 200 con la base de datos disponible", async () => {
    pg.query = async () => ({ rows: [{ "?column?": 1 }] });
    const r = await fetch(base + "/health");
    assert.equal(r.status, 200);
});

test("POST /sign-up valida los datos antes de tocar la base de datos", async () => {
    let consultas = 0;
    pg.query = async () => { consultas++; return { rows: [] }; };
    for (const cuerpo of [
    {},
        { name: "Ana", email: "mal", password: "123456" },
        { name: "Ana", email: "ana@correo.co", password: "123" },
        { name: " ", email: "ana@correo.co", password: "123456" },
    ]) {
    const r = await post("/sign-up", cuerpo);
    assert.equal(r.status, 400);
    }
    assert.equal(consultas, 0);
});

test("POST /sign-up guarda el correo normalizado y un hash (no la clave)", async () => {
    let parametros;
    pg.query = async (_sql, valores) => { parametros = valores; return { rows: [{ id: 1 }] }; };
    const r = await post("/sign-up", { name: " Ana ", email: " Ana@Correo.co ", password: "123456" });
    assert.equal(r.status, 201);
    assert.equal(parametros[0], "Ana");
    assert.equal(parametros[1], "ana@correo.co");
    assert.notEqual(parametros[2], "123456");
    assert.ok(await bcrypt.compare("123456", parametros[2]));
});

test("POST /sign-up devuelve 409 si el correo ya existe", async () => {
    pg.query = async () => { const e = new Error("duplicado"); e.code = "23505"; throw e; };
    const r = await post("/sign-up", { name: "Ana", email: "ana@correo.co", password: "123456" });
    assert.equal(r.status, 409);
});

test("POST /sign-in usa el mismo mensaje para usuario inexistente y clave incorrecta", async () => {
    pg.query = async () => ({ rows: [] });
    const inexistente = await post("/sign-in", { email: "x@correo.co", password: "123456" });

    const hash = await bcrypt.hash("correcta", 4);
    pg.query = async () => ({ rows: [{ id: 1, password: hash }] });
    const incorrecta = await post("/sign-in", { email: "x@correo.co", password: "otra-clave" });

    assert.equal(inexistente.status, 401);
    assert.equal(incorrecta.status, 401);
    assert.deepEqual(await inexistente.json(), await incorrecta.json());
    });

test("POST /sign-in acepta credenciales correctas", async () => {
    const hash = await bcrypt.hash("correcta", 4);
    pg.query = async () => ({ rows: [{ id: 1, password: hash }] });
    const r = await post("/sign-in", { email: "x@correo.co", password: "correcta" });
    assert.equal(r.status, 200);
});

test("GET /usuarios exige la clave de administrador y no devuelve password", async () => {
    pg.query = async () => ({ rows: [{ id: 1, name: "Ana", email: "ana@correo.co" }] });

    const sinClave = await fetch(base + "/usuarios");
    assert.equal(sinClave.status, 401);

    const claveMala = await fetch(base + "/usuarios", { headers: { "x-admin-key": "otra" } });
    assert.equal(claveMala.status, 401);

    const ok = await fetch(base + "/usuarios", { headers: { "x-admin-key": "clave-de-prueba" } });
    assert.equal(ok.status, 200);
    const datos = await ok.json();
    assert.equal("password" in datos[0], false);
});

test("DELETE /usuarios/:id valida el id y exige administrador", async () => {
    pg.query = async () => ({ rowCount: 1 });
    const sinClave = await fetch(base + "/usuarios/1", { method: "DELETE" });
    assert.equal(sinClave.status, 401);

    const idMalo = await fetch(base + "/usuarios/1;DROP", { method: "DELETE", headers: { "x-admin-key": "clave-de-prueba" } });
    assert.equal(idMalo.status, 400);

    const ok = await fetch(base + "/usuarios/1", { method: "DELETE", headers: { "x-admin-key": "clave-de-prueba" } });
    assert.equal(ok.status, 200);
});

test("CORS permite el dominio de produccion y bloquea los desconocidos", async () => {
    const permitido = await fetch(base + "/", { headers: { Origin: "https://recetario.example.com" } });
    assert.equal(permitido.headers.get("access-control-allow-origin"), "https://recetario.example.com");

    const bloqueado = await fetch(base + "/", { headers: { Origin: "https://malicioso.com" } });
    assert.equal(bloqueado.headers.get("access-control-allow-origin"), null);
});

test("el limitador bloquea tras demasiados intentos de sign-in (429)", async () => {
    pg.query = async () => ({ rows: [] });
    let ultimo;
    for (let i = 0; i < 12; i++) {
        ultimo = await post("/sign-in", { email: "x@correo.co", password: "123456" });
    }
    assert.equal(ultimo.status, 429);
    assert.ok(ultimo.headers.get("retry-after"));
});
