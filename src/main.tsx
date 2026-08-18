import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./context/ThemeContext";
import { ProductsProvider } from "./context/ProductsContext";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found in index.html");

createRoot(rootEl).render(
    <StrictMode>
        <ThemeProvider>
            <ProductsProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ProductsProvider>
        </ThemeProvider>
    </StrictMode>,
);
