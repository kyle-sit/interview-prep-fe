import { Route, Routes } from "react-router";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { practiceRoutes } from "./routes/routes";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />

                {practiceRoutes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
