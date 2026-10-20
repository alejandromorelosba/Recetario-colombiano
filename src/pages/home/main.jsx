import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.jsx";
import ListOfFood from "./ListOfFood.jsx";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

const recipes = createRoot(document.getElementById("recipes"));
recipes.render(<ListOfFood />);