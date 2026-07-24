/** Barra de navegacion reutilizable **/
import React from "react";
import "./NavBar.css";

export default function NavBar() {
    return (
        <nav className="navBar">
            <ul>
                <li><a href="/#inicio">Inicio</a></li>
                <li><a href="/#intro">Introducción</a></li>
                <li><a href="/#historia">Historia</a></li>
                <li><a href="/#ingredientes">Ingredientes</a></li>
                <li><a href="/#complementos">Acompañantes</a></li>
                <li><a href="/#datos">Datos Curiosos</a></li>
            </ul>
            <ul className="navAuth">
                <li><a href="/login" className="btnLogin">Iniciar sesión</a></li>
                <li><a href="/registro" className="btnRegistro">Registrarse</a></li>
            </ul>
        </nav>
    );
}