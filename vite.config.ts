import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { forumApi } from "./mocks/forumApi";

export default defineConfig({
    plugins: [react(), forumApi()],
    server: {
        port: 5173,
        open: false,
    },
});
