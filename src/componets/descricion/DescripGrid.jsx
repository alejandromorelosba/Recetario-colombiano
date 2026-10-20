import React from "react";
import Descrip from "./Descrip.jsx";
import "./descrip.css";

/** Cuadricula reutilizable: maximo 2 tarjetas por fila, crece hacia abajo **/
export default function DescripGrid({ items = [] }) {
    return (
        <section className="descripGrid">
            {items.map((item) => (
                <Descrip key={item.enlace} {...item} />
            ))}
        </section>
    );
}