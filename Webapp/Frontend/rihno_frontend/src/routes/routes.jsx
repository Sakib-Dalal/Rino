import { createBrowserRouter } from "react-router-dom";

import App from "../App.jsx";
import Error404 from "../pages/Error404.jsx";

import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Documentation from "../pages/Documentation.jsx";
import Contact from "../pages/Contact.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <Error404 />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <About /> },
            { path: "documentation", element: <Documentation /> },
            { path: "contact", element: <Contact /> },

            {
                path: "dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
        ]
    }
]);
