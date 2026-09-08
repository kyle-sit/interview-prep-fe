import type { Plugin } from "vite";

/**
 * Dev-only stand-in for jsonplaceholder's /posts and /comments.
 *
 * The real endpoint never returns comment bodies containing "@<id>", which makes
 * the nesting rule in 02-forum-threads.md Task 3 impossible to exercise. Same
 * response shapes, so the parsing code is unchanged.
 */

const POSTS = [
    {
        userId: 1,
        id: 1,
        author: "dana",
        title: "Vite build is slow on CI",
        body: "Six minutes.",
    },
    {
        userId: 2,
        id: 2,
        author: "kai",
        title: "Prettier vs ESLint in 2026",
        body: "Do I need both?",
    },
    {
        userId: 1,
        id: 3,
        author: "sam",
        title: "Why is my bundle 4MB?",
        body: "It was 400kb.",
    },
    {
        userId: 3,
        id: 4,
        author: "ora",
        title: "Anyone using the React 19 compiler?",
        body: "Worth it?",
    },
];

const COMMENTS = [
    // Thread 1 — a three-deep chain, a second root, and a dangling reference.
    {
        postId: 1,
        id: 101,
        name: "sam",
        email: "sam@x.dev",
        body: "Caching node_modules?",
    },
    {
        postId: 1,
        id: 102,
        name: "dana",
        email: "dana@x.dev",
        body: "@101 Yes, still 8m.",
    },
    {
        postId: 1,
        id: 103,
        name: "kai",
        email: "kai@x.dev",
        body: "@102 Split typecheck.",
    },
    {
        postId: 1,
        id: 104,
        name: "rai",
        email: "rai@x.dev",
        body: "Check your sourcemaps.",
    },
    {
        postId: 1,
        id: 105,
        name: "ora",
        email: "ora@x.dev",
        body: "@999 No such comment.",
    },

    // Thread 2 — no replies at all, so the count reads 0.

    // Thread 3 — two siblings replying to the same parent.
    { postId: 3, id: 301, name: "dana", email: "dana@x.dev", body: "Run the analyzer." },
    { postId: 3, id: 302, name: "sam", email: "sam@x.dev", body: "@301 It's moment.js." },
    {
        postId: 3,
        id: 303,
        name: "kai",
        email: "kai@x.dev",
        body: "@301 Two React copies?",
    },

    // Thread 4 — a four-deep chain.
    { postId: 4, id: 401, name: "ora", email: "ora@x.dev", body: "Shipping it in prod." },
    {
        postId: 4,
        id: 402,
        name: "rai",
        email: "rai@x.dev",
        body: "@401 Issues with memo?",
    },
    {
        postId: 4,
        id: 403,
        name: "sam",
        email: "sam@x.dev",
        body: "@402 It removes most.",
    },
    {
        postId: 4,
        id: 404,
        name: "kai",
        email: "kai@x.dev",
        body: "@403 Deleted 200 of em.",
    },
];

/** Latency so the loading state is visible rather than a single frame. */
const DELAY_MS = 250;

export function forumApi(): Plugin {
    return {
        name: "forum-api",
        configureServer(server) {
            server.middlewares.use("/api", (req, res) => {
                // `use` with a prefix strips it, so req.url is "/posts?..." here.
                const url = new URL(req.url ?? "/", "http://localhost");

                const send = (status: number, payload: unknown) => {
                    setTimeout(() => {
                        res.statusCode = status;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify(payload));
                    }, DELAY_MS);
                };

                // ?fail=1 on any request, to exercise the error and retry path.
                if (url.searchParams.get("fail") === "1") {
                    send(500, { error: "Simulated failure" });
                    return;
                }

                if (url.pathname === "/posts") {
                    const limit = Number(url.searchParams.get("_limit") ?? POSTS.length);
                    send(200, POSTS.slice(0, limit));
                    return;
                }

                if (url.pathname === "/comments") {
                    const postId = Number(url.searchParams.get("postId"));
                    send(
                        200,
                        COMMENTS.filter((c) => c.postId === postId),
                    );
                    return;
                }

                send(404, { error: `No route for ${url.pathname}` });
            });
        },
    };
}
