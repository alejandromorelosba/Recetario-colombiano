/**
 * Configuracion centralizada de la API.
 * Parcel reemplaza process.env.API_URL en tiempo de build
 * usando el archivo .env (desarrollo) o .env.production (build de produccion).
 * Si no existe la variable, se usa localhost como valor por defecto.
 */
export const API_URL = process.env.API_URL || "http://localhost:5432";