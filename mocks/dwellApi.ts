import type { Plugin } from "vite";
import { parseUrl, readJsonBody, sendJson } from "./http";

/**
 * Dev-only backend for 04-dwell-tracker.md.
 *
 * Totals persist for the life of the dev server, so a reload should show the
 * dwell time accumulated before it.
 */

const CARDS = [
    { id: 1, label: "Rates" },
    { id: 2, label: "Bookings" },
    { id: 3, label: "Customs" },
    { id: 4, label: "Tracking" },
];

let SAVED: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

/** Both routes answer with the whole resource: every card, label and total. */
function cardsWithTotals() {
    return CARDS.map((card) => ({ ...card, ms: SAVED[card.id] ?? 0 }));
}

export function dwellApi(): Plugin {
    return {
        name: "dwell-api",
        configureServer(server) {
            server.middlewares.use("/api", (req, res, next) => {
                const url = parseUrl(req);
                if (!url.pathname.startsWith("/dwell")) return next();

                if (url.searchParams.get("fail") === "1") {
                    sendJson(res, 500, { error: "Write failed" });
                    return;
                }

                if (url.pathname === "/dwell" && req.method === "GET") {
                    sendJson(res, 200, cardsWithTotals());
                    return;
                }

                // POST /api/dwell/{cardId} with { ms }
                const match = url.pathname.match(/^\/dwell\/(\d+)$/);
                if (match && req.method === "POST") {
                    const cardId = Number(match[1]);
                    void readJsonBody(req).then((body) => {
                        const { ms } = body as { ms?: number };
                        if (typeof ms !== "number" || Number.isNaN(ms)) {
                            sendJson(res, 400, { error: "Expected { ms: number }" });
                            return;
                        }
                        if (!CARDS.some((card) => card.id === cardId)) {
                            sendJson(res, 404, { error: `No card ${cardId}` });
                            return;
                        }
                        SAVED = { ...SAVED, [cardId]: ms };
                        sendJson(res, 200, cardsWithTotals());
                    });
                    return;
                }

                sendJson(res, 404, { error: `No route for ${url.pathname}` });
            });
        },
    };
}
