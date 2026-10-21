/** Barra de navegacion reutilizable **/
import React from "react";
import "./navBar.css";

// Enlaces de la fila inferior (aun en desarrollo)
const enlaces = [
    { texto: "Receta", href: "/recetas" },
    { texto: "Aperitivos", href: "/Aperitivos" },
    { texto: "postres", href: "/Postres" },
    { texto: "departamentos", href: "/Departamentos" },
    { texto: "contactos", href: "/Contactos" },
];

// Evita que el enlace navegue y avisa que la funcion no esta lista
function enDesarrollo(evento) {
    evento.preventDefault();
    alert("los links de ver las demas opciones estan en desarrollo.");
}

export default function NavBar() {
    return (
        // Fila superior: logo + buscador + sesion | Fila inferior: enlaces
        <nav className="navBar">

            <h1 className="navLogo">
                <a href="../../index.html">Recetario Colombiano</a>
            </h1>

            <form className="searchForm" action="/search" method="get">
                <input type="text" name="q" placeholder="Buscar receta..." />
                <button type="submit">Buscar</button>
            </form>

            <ul className="navAuth">
                <li><a href="../../login.html" className="btnLogin">Iniciar sesión</a></li>
                <li><a href="../../Registrar.html" className="btnRegistro">Registrarse</a></li>
            </ul>

            <ul className="navLinks">
                {enlaces.map((enlace) => (
                    <li key={enlace.href}>
                        <a href={enlace.href} onClick={enDesarrollo}>{enlace.texto}</a>
                    </li>
                ))}
            </ul>

        </nav>
    );
}