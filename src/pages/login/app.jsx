/** Datos y librerias a utilizar **/
import React, { useState } from "react";
import "./Login.css";
import "../../componets/NavBar/navBar.Jsx"
import NavBar from "../../componets/NavBar/navBar.Jsx";
import { API_URL } from "../../Services/config.js";

/** Componente de inicio de sesion **/
export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [cargando, setCargando] = useState(false);

    const validar = () => {
        const nuevosErrores = {};

        if (email.trim() === "") {
            nuevosErrores.email = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevosErrores.email = "Ingresa un correo válido.";
        }

        if (password.trim() === "") {
            nuevosErrores.password = "La contraseña es obligatoria.";
        } else if (password.length < 6) {
            nuevosErrores.password = "Debe tener al menos 6 caracteres.";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorGeneral("");
        setMensajeExito("");

        if (!validar()) {
            return;
        }

        setCargando(true);

        try {
            const respuesta = await fetch(`${API_URL}/sign-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                // El servidor respondio con 400/401/500: usamos su mensaje de error
                throw new Error(datos.error || "Credenciales incorrectas");
            }

            // Login correcto: guardamos una sesion simple en el navegador
            setMensajeExito(datos.message || "Bienvenido!");
            localStorage.setItem(
                "recetario_usuario",
                JSON.stringify({ email })
            );

            // Redirige a la pagina de inicio despues de un breve instante
            setTimeout(() => {
                window.location.href = "/";
            }, 1200);
        } catch (err) {
            setErrorGeneral(err.message || "Usuario o contraseña incorrectos.");
        } finally {
            setCargando(false);
        }
    };

    return (
    <>
        <NavBar />
        <div className="login-page">
            <div className="login-card">
                <h2>Iniciar sesión</h2>
                <p className="subtitulo">
                    Ingresa para guardar y calificar tus recetas favoritas
                </p>

                {errorGeneral && (
                    <div className="error-general" style={{ display: "block" }}>
                        {errorGeneral}
                    </div>
                )}

                {mensajeExito && (
                    <div className="mensaje-exito" style={{ display: "block" }}>
                        {mensajeExito}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="campo">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                        {errores.email && (
                            <span className="error-campo">{errores.email}</span>
                        )}
                    </div>

                    <div className="campo campo-password">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type={mostrarPassword ? "text" : "password"}
                            placeholder="Tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                        >
                            {mostrarPassword ? "Ocultar" : "Mostrar"}
                        </button>
                        {errores.password && (
                            <span className="error-campo">{errores.password}</span>
                        )}
                    </div>

                    <button type="submit" disabled={cargando}>
                        {cargando ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <p className="registro">
                    ¿No tienes cuenta? <a href="/Registrar.html">Regístrate aquí</a>
                </p>
            </div>
        </div>
    </>
    );
}