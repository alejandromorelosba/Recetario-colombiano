/** Barra de navegacion reutilizable **/
import React from "react";
import "./navBar.css";

export default function NavBar() {
    return (
        // Fila superior: logo + buscador + sesion | Fila inferior: enlaces
        <nav className="navBar">

            <h1 className="navLogo">
                <a href="/src/index.html">Recetario Colombiano</a>
            </h1>

            <form className="searchForm" action="/search" method="get">
                <input type="text" name="q" placeholder="Buscar receta..." />
                <button type="submit">Buscar</button>
            </form>

            <ul className="navAuth">
                <li><a href="/src/login.html" className="btnLogin">Iniciar sesión</a></li>
                <li><a href="/src/Registrar.html" className="btnRegistro">Registrarse</a></li>
            </ul>

            <ul className="navLinks">
                <li><a href="/recetas">Receta</a></li>
                <li><a href="/#complementos">postres</a></li>
                <li><a href="/#ingredientes">departamentos</a></li>
                <li><a href="/#datos">Datos Curiosos</a></li>
            </ul>

        </nav>
    );
}