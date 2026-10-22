/**
 * Limitador de intentos en memoria (sin dependencias externas).
 * Mitiga ataques de fuerza bruta sobre /sign-in.
 * Nota: al vivir en memoria se reinicia con el servidor; para varias
 * instancias se recomienda un almacen compartido (p. ej. Redis).
 */
function crearLimitador({ maxIntentos = 10, ventanaMs = 15 * 60 * 1000 } = {}) {
const intentos = new Map();

return function limitador(request, response, next) {
    const ahora = Date.now();
    const clave = request.ip;
    const registro = intentos.get(clave);

    if (!registro || ahora > registro.expira) {
        intentos.set(clave, { cuenta: 1, expira: ahora + ventanaMs });
        return next();
    }

    registro.cuenta += 1;
    if (registro.cuenta > maxIntentos) {
        const segundos = Math.ceil((registro.expira - ahora) / 1000);
        response.set("Retry-After", String(segundos));
        return response
        .status(429)
        .json({ error: "Demasiados intentos. Intenta de nuevo mas tarde." });
    }
    return next();
    };
}

module.exports = { crearLimitador };
