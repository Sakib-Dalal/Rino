import { createBrowserRouter } from "react-router-dom";

import App from "../App.jsx";
import Error404 from "../pages/Error404.jsx";
import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Documentation from "../pages/Documentation.jsx";
import Contact from "../pages/Contact.jsx";

// Import the new components
import Dashboard from "../pages/Dashboard.jsx"; // This is your layout file
import DashboardHome from "../pages/DashboardHome.jsx";
import Servers from "../pages/Servers.jsx";
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
                        {/* The Dashboard acts as the layout (Top + Bottom bars) */}
                        <Dashboard />
                    </ProtectedRoute>
                ),
                children: [
                    // This renders at /dashboard (The Welcome Screen)
                    { index: true, element: <DashboardHome /> },

                    // This renders at /dashboard/servers (The Server List)
                    { path: "servers", element: <Servers /> },

                    // Placeholders for other buttons:
                    { path: "data", element: <div className="text-center text-2xl font-black mt-10">DATA PAGE</div> },
                    { path: "user", element: <div className="text-center text-2xl font-black mt-10">USER PAGE</div> },
                ]
            },
        ]
    }
]);