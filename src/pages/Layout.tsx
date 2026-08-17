import { NavLink, Outlet } from "react-router";
import { practiceRoutes } from "../routes/routes";
import { useTheme } from "../context/ThemeContext";
import "./Layout.css";

const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link nav-link--active" : "nav-link";

export default function Layout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <nav className="nav">
                <NavLink to="/" end className={linkClass}>
                    Index
                </NavLink>
                {practiceRoutes.map(({ path, label }) => (
                    <NavLink key={path} to={`/${path}`} className={linkClass}>
                        {label}
                    </NavLink>
                ))}

                <button type="button" className="theme-toggle" onClick={toggleTheme}>
                    {theme === "light" ? "Switch to dark" : "Switch to light"}
                </button>
            </nav>

            <main className="content">
                <Outlet />
            </main>
        </>
    );
}
