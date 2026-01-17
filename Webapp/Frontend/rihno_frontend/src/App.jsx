import './App.css'
import NavBar from "./components/NavBar.jsx";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

function App() {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // NEW: Automatically redirect to dashboard if logged in and currently on the home page
    useEffect(() => {
        if (auth.isAuthenticated && location.pathname === "/") {
            navigate("/dashboard");
        }
    }, [auth.isAuthenticated, location.pathname, navigate]);

    return (
        <>
            {/* Show NavBar only if NOT authenticated */}
            {!auth.isAuthenticated && (
                <div className="p-4">
                    <NavBar />
                </div>
            )}

            {/* This renders Home, Dashboard, etc. */}
            <Outlet />
        </>
    );
}

export default App;