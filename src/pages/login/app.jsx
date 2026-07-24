/** Datos y librerias a utilizar **/
import React, { useState } from "react";
import "./Login.css";
import "../../componets/NavBar/navBar.Jsx"
import NavBar from "../../componets/NavBar/navBar.Jsx";

/** Componente de inicio de sesion **/
export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState("");
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

        if (!validar()) {
            return;
        }

        setCargando(true);

        try {
            // Aqui se conecta con el backend/API real de autenticacion
            // const respuesta = await fetch("/api/login", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({ email, password }),
            // });
            // if (!respuesta.ok) throw new Error("Credenciales incorrectas");

            console.log("Iniciando sesion con:", { email, password });
        } catch (err) {
            setErrorGeneral("Usuario o contraseña incorrectos.");
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
                    ¿No tienes cuenta? <a href="#registro">Regístrate aquí</a>
                </p>
            </div>
        </div>
    </>
    );
}