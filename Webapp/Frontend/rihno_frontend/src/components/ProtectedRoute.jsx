import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <div className="h-screen flex items-center justify-center font-bold">
                Loading...
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}
