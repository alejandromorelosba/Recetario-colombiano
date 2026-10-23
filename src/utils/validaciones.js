/**
 * Validaciones del frontend (ES Modules).
 * Deben mantener EXACTAMENTE las mismas reglas y mensajes que el backend
 * (src/Services/validaciones.js); el test de Test/validaciones.test.js lo comprueba.
 */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_PASSWORD = 6;

export function normalizarEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validarEmail(email) {
  if (typeof email !== "string" || email.trim() === "") {
    return "El correo es obligatorio.";
  }
  if (!REGEX_EMAIL.test(email.trim())) {
    return "Ingresa un correo valido.";
  }
  return null;
}

export function validarPassword(password) {
  if (typeof password !== "string" || password.trim() === "") {
    return "La contrasena es obligatoria.";
  }
  if (password.length < LONGITUD_MINIMA_PASSWORD) {
    return `Debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`;
  }
  return null;
}

// OJO: en la captura no se alcanza a ver esta funcion completa en el backend.
// Compara el texto del mensaje con el de src/Services/validaciones.js y copialo igual.
export function validarNombre(name) {
  if (typeof name !== "string" || name.trim() === "") {
    return "El nombre es obligatorio.";
  }
  return null;
}