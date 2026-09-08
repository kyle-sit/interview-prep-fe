import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

/** Latency on every mock response, so loading states last longer than a frame. */
const DELAY_MS = 250;

export function sendJson(res: ServerResponse, status: number, payload: unknown) {
    setTimeout(() => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(payload));
    }, DELAY_MS);
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    if (chunks.length === 0) return {};
    try {
        return JSON.parse(Buffer.concat(chunks).toString());
    } catch {
        return {};
    }
}

/** `middlewares.use("/api", ...)` strips the prefix, so req.url is "/tickets?x=1". */
export function parseUrl(req: IncomingMessage) {
    return new URL(req.url ?? "/", "http://localhost");
}

/**
 * Register last. Without it an unhandled /api path falls through to Vite's SPA
 * handler and returns index.html with a 200, so a typo'd URL surfaces as a JSON
 * parse error rather than a 404.
 */
export function apiFallback(): Plugin {
    return {
        name: "api-fallback",
        configureServer(server) {
            server.middlewares.use("/api", (req, res) => {
                sendJson(res, 404, {
                    error: `No mock route for ${parseUrl(req).pathname}`,
                });
            });
        },
    };
}
