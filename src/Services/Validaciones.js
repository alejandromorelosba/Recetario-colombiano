/**
 * Validaciones compartidas del backend (CommonJS).
 * Centralizan las reglas para que /sign-up y /sign-in usen el mismo criterio
 * que ya aplica el frontend (src/utils/validaciones.js).
 */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_PASSWORD = 6;

function normalizarEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function validarEmail(email) {
    if (typeof email !== "string" || email.trim() === "") {
        return "El correo es obligatorio.";
    }
    if (!REGEX_EMAIL.test(email.trim())) {
        return "Ingresa un correo valido.";
    }
        return null;
}

function validarPassword(password) {
    if (typeof password !== "string" || password.trim() === "") {
        return "La contrasena es obligatoria.";
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
        return `Debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`;
    }
        return null;
}

function validarNombre(name) {
    if (typeof name !== "string" || name.trim() === "") {
        return "El nombre es obligatorio.";
    }
        return null;
}

module.exports = {
    normalizarEmail,
    validarEmail,
    validarPassword,
    validarNombre,
    LONGITUD_MINIMA_PASSWORD,
};
