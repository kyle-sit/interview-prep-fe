import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { forumApi } from "./mocks/forumApi";
import { ticketApi } from "./mocks/ticketApi";
import { dwellApi } from "./mocks/dwellApi";
import { apiFallback } from "./mocks/http";

export default defineConfig({
    plugins: [react(), forumApi(), ticketApi(), dwellApi(), apiFallback()],
    server: {
        port: 5173,
        open: false,
    },
});
