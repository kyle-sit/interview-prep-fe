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
