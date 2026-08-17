import { Link } from "react-router";
import { practiceRoutes } from "../routes/routes";

export default function Home() {
    return (
        <>
            <h1>interview-prep</h1>
            <p>Practice components, each on its own route.</p>
            <ul>
                {practiceRoutes.map(({ path, label }) => (
                    <li key={path}>
                        <Link to={`/${path}`}>{label}</Link>
                    </li>
                ))}
            </ul>
        </>
    );
}

/*
 * ---------------------------------------------------------------------------
 * Alternative A — <a> + useNavigate(), i.e. <Link> unwrapped.
 *
 * Needs: import type { MouseEvent } from "react";
 *        import { useNavigate } from "react-router";
 *
 * export default function Home() {
 *     const navigate = useNavigate();
 *
 *     function handleClick(e: MouseEvent<HTMLAnchorElement>, to: string) {
 *         // Bail out and let the browser do its native thing for anything
 *         // that isn't a plain left-click: cmd/ctrl-click (new tab),
 *         // shift-click (new window), middle-click.
 *         if (
 *             e.defaultPrevented ||
 *             e.button !== 0 ||
 *             e.metaKey ||
 *             e.altKey ||
 *             e.ctrlKey ||
 *             e.shiftKey
 *         ) {
 *             return;
 *         }
 *         e.preventDefault();
 *         navigate(to);
 *     }
 *
 *     return (
 *         <>
 *             <h1>interview-prep</h1>
 *             <p>Practice components, each on its own route.</p>
 *             <ul>
 *                 {practiceRoutes.map(({ path, label }) => (
 *                     <li key={path}>
 *                         <a
 *                             href={`/${path}`}
 *                             onClick={(e) => handleClick(e, `/${path}`)}
 *                         >
 *                             {label}
 *                         </a>
 *                     </li>
 *                 ))}
 *             </ul>
 *         </>
 *     );
 * }
 *
 * The href is not decorative: it drives right-click / middle-click / hover
 * preview, and it is the fallback before JS hydrates.
 *
 * What this gives up vs <Link>: basename prefixing, relative `to` resolution
 * ("../foo"), the replace/state/preventScrollReset props, and respecting
 * target="_blank". None of it bites here — flat routes, no basename.
 * ---------------------------------------------------------------------------
 */

/*
 * ---------------------------------------------------------------------------
 * Alternative B — raw History API, no router hooks at all.
 *
 * function navigateRaw(to: string) {
 *     window.history.pushState({}, "", to);
 *     // pushState does NOT fire popstate. Without this line the URL bar
 *     // changes and the page does not.
 *     window.dispatchEvent(new PopStateEvent("popstate"));
 * }
 *
 * export default function Home() {
 *     return (
 *         <>
 *             <h1>interview-prep</h1>
 *             <p>Practice components, each on its own route.</p>
 *             <ul>
 *                 {practiceRoutes.map(({ path, label }) => (
 *                     <li key={path}>
 *                         <a
 *                             href={`/${path}`}
 *                             onClick={(e) => {
 *                                 e.preventDefault();
 *                                 navigateRaw(`/${path}`);
 *                             }}
 *                         >
 *                             {label}
 *                         </a>
 *                     </li>
 *                 ))}
 *             </ul>
 *         </>
 *     );
 * }
 *
 * The dispatchEvent line is the whole lesson. popstate only fires on
 * back/forward, so pushState mutates the URL and notifies nobody.
 * BrowserRouter subscribes to popstate, so faking the event is what forces it
 * to re-read window.location and re-render. It works, but it reaches into the
 * router's internals from outside — if the subscription mechanism ever
 * changed, this breaks with no type error.
 * ---------------------------------------------------------------------------
 */
