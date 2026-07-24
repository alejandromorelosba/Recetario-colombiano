import React from "react";
import { createRoot } from "react-dom/client";
import Login from "./app"; // "Login" aquí es el nombre que YO le doy al importar, no depende del nombre interno

const root = createRoot(document.getElementById('root'));
root.render(<Login/>);