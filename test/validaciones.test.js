const test = require("node:test");
const assert = require("node:assert/strict");
const {
    validarEmail,
    validarPassword,
    validarNombre,
    normalizarEmail,
} = require("../src/Services/validaciones");

test("validarEmail acepta correos validos y rechaza invalidos", () => {
    assert.equal(validarEmail("kuro@sena.edu.co"), null);
    assert.ok(validarEmail(""));
    assert.ok(validarEmail("sin-arroba"));
    assert.ok(validarEmail(undefined));
});

test("validarPassword exige minimo 6 caracteres", () => {
    assert.equal(validarPassword("123456"), null);
    assert.ok(validarPassword("12345"));
    assert.ok(validarPassword("   "));
    assert.ok(validarPassword(null));
});

test("validarNombre rechaza vacios", () => {
    assert.equal(validarNombre("Juan Alcachofa"), null);
    assert.ok(validarNombre("  "));
});

test("normalizarEmail recorta y pasa a minusculas", () => {
    assert.equal(normalizarEmail("  Kuro@SENA.edu.co "), "kuro@sena.edu.co");
});

test("las reglas del frontend coinciden con las del backend", async () => {
    const front = await import("../src/utils/validaciones.js");
    for (const correo of ["kuro@sena.edu.co", "", "sin-arroba"]) {
    assert.equal(Boolean(front.validarEmail(correo)), Boolean(validarEmail(correo)));
    }
    for (const clave of ["123456", "12345", "  "]) {
        assert.equal(Boolean(front.validarPassword(clave)), Boolean(validarPassword(clave)));
    }
});
