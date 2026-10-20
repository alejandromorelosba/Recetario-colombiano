import React from "react";
import "./descrip.css";

/** Tarjeta reutilizable (estilo YouTube): miniatura arriba, texto abajo **/
export default function Descrip({ imagen, titulo, descripcion, enlace, textoBoton = "Ver receta" }) {
    return (
        <article className="descrip">

            <a href={enlace} className="descripMiniatura">
                <img src={imagen} alt={titulo} className="descripImg" loading="lazy" />
            </a>

            <div className="descripInfo">
                <h3 className="descripTitulo">
                    <a href={enlace}>{titulo}</a>
                </h3>

                <p className="descripTexto">{descripcion}</p>

                <a href={enlace} className="btnReceta">{textoBoton}</a>
            </div>

        </article>
    );
}