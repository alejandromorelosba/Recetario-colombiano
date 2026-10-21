import React from "react";
import DescripGrid from "../../componets/descricion/DescripGrid.jsx";

// Parcel devolvio un objeto con el import normal; con new URL(...) devuelve la ruta real.
// La ruta es relativa a ESTE archivo (aqui: imagen en la misma carpeta)
const arrozConPollo = new URL("../../../public/imagenes/VAR151010F8-5224934_7798908-scaled.jpg", import.meta.url).href;

const recipes = [
    {
        imagen: arrozConPollo,
        titulo: "Arroz con pollo",
        descripcion: "Plato tradicional colombiano que se prepara con arroz, pollo y una variedad de especias.",
        enlace: "/src/Rice_chiken.html",
    },
];

export default function ListOfFood() {
    <h3>Recetas recomendadas</h3>;
    return <DescripGrid items={recipes} />;
}