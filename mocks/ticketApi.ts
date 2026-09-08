import type { Plugin } from "vite";
import { parseUrl, readJsonBody, sendJson } from "./http";

/**
 * Dev-only backend for 03-ticket-queue.md.
 *
 * State lives in this module, so it mutates across requests the way a real queue
 * would. Editing this file resets it — the dev server reloads the plugin.
 */

type Ticket = {
    id: number;
    title: string;
    requester: string;
    status: "open" | "pending" | "closed";
    age: number;
};

let TICKETS: Ticket[] = [
    { id: 1, title: "Card declined", requester: "dana", status: "open", age: 4 },
    { id: 2, title: "Refund not received", requester: "sam", status: "pending", age: 31 },
    { id: 3, title: "Cannot reset password", requester: "kai", status: "open", age: 12 },
    { id: 4, title: "Duplicate charge", requester: "dana", status: "closed", age: 90 },
    { id: 5, title: "Refund taking too long", requester: "ora", status: "open", age: 58 },
    {
        id: 6,
        title: "Cannot add payment method",
        requester: "kai",
        status: "open",
        age: 7,
    },
    { id: 7, title: "Account locked out", requester: "rai", status: "pending", age: 140 },
    {
        id: 8,
        title: "Charged twice for one order",
        requester: "sam",
        status: "open",
        age: 2,
    },
];

export function ticketApi(): Plugin {
    return {
        name: "ticket-api",
        configureServer(server) {
            server.middlewares.use("/api", (req, res, next) => {
                const url = parseUrl(req);
                if (!url.pathname.startsWith("/tickets")) return next();

                if (url.searchParams.get("fail") === "1") {
                    sendJson(res, 500, { error: "Simulated failure" });
                    return;
                }

                if (url.pathname === "/tickets" && req.method === "GET") {
                    // Every poll ages open tickets by one minute.
                    TICKETS = TICKETS.map((t) =>
                        t.status === "open" ? { ...t, age: t.age + 1 } : t,
                    );
                    sendJson(res, 200, TICKETS);
                    return;
                }

                if (url.pathname === "/tickets/status" && req.method === "POST") {
                    void readJsonBody(req).then((body) => {
                        const { ids, status } = body as {
                            ids?: number[];
                            status?: Ticket["status"];
                        };

                        if (!Array.isArray(ids) || !status) {
                            sendJson(res, 400, { error: "Expected { ids, status }" });
                            return;
                        }
                        if (status === "closed" && ids.length > 3) {
                            sendJson(res, 400, { error: "Bulk close limited to 3" });
                            return;
                        }

                        TICKETS = TICKETS.map((t) =>
                            ids.includes(t.id) ? { ...t, status } : t,
                        );
                        sendJson(res, 200, TICKETS);
                    });
                    return;
                }

                sendJson(res, 404, { error: `No route for ${url.pathname}` });
            });
        },
    };
}
