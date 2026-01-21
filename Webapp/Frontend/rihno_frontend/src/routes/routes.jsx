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
import Data from "../pages/Data.jsx";
import Activity from "../pages/Activity.jsx";
import Analytics from "../pages/Analytics.jsx";
import NetworkMap from "../pages/NetworkMap.jsx";
import AI from "../pages/AI.jsx";
import Notification from "../pages/Notification.jsx";
import Config from "../pages/Config.jsx";

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
                    { path: "data", element: <Data /> },
                    { path: "activity", element: <Activity /> },
                    { path: "analytics", element: <Analytics /> },
                    { path: "networkmap", element: <NetworkMap /> },
                    { path: "ai", element: <AI /> },
                    { path: "notification", element: <Notification /> },
                    { path: "config", element: <Config /> },
                ]
            },
        ]
    }
]);