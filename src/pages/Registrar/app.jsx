/** Datos y librerias a utilizar **/
import React, { useState } from "react";
import "./Registro.css";
import NavBar from "../../componets/NavBar/navBar.Jsx";
import { API_URL } from "../../Services/config.js";

/** Componente de registro de usuario **/
export default function Registro() {

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [cargando, setCargando] = useState(false);

    const validar = () => {
        const nuevosErrores = {};

        if (nombre.trim() === "") {
            nuevosErrores.nombre = "El nombre completo es obligatorio.";
        }

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
            const respuesta = await fetch(`${API_URL}/sign-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // La API espera el campo "name", por eso se traduce desde "nombre"
                body: JSON.stringify({ name: nombre, email, password }),
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.error || "No se pudo completar el registro");
            }

            setMensajeExito(datos.message || "Cuenta creada correctamente!");

            // Redirige al login despues de un breve instante
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 1200);
        } catch (err) {
            setErrorGeneral(err.message || "No se pudo completar el registro. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    return (
    <>     
        <NavBar />
        <div className="registro-page">
            <div className="registro-card">
                <h2>Crear cuenta</h2>
                <p className="subtitulo">
                    Regístrate para guardar y calificar tus recetas favoritas
                </p>

                {errorGeneral && (
                    <div className="error-general">{errorGeneral}</div>
                )}

                {mensajeExito && (
                    <div className="mensaje-exito">{mensajeExito}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="campo">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Juan Alcachofa"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            autoComplete="name"
                        />
                        {errores.nombre && (
                            <span className="error-campo">{errores.nombre}</span>
                        )}
                    </div>

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
                            autoComplete="new-password"
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
                        {cargando ? "Creando cuenta..." : "Registrarme"}
                    </button>
                </form>

                <p className="ingreso">
                    ¿Ya tienes cuenta? <a href="#login">Inicia sesión aquí</a>
                </p>
            </div>
        </div>
    </>
    );
}