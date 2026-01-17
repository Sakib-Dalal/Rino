import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from "react-oidc-context"

import './index.css'
import { router } from "./routes/routes.jsx"
// Import the config file if you created it, otherwise use the hardcoded fallback inside the component if needed
// But assuming you have the authConfig.js from the previous step:
import { cognitoConfig } from "./authConfig.js";

const oidcConfig = {
    authority: cognitoConfig.authority,
    client_id: cognitoConfig.client_id,
    redirect_uri: cognitoConfig.redirect_uri,
    response_type: "code",
    scope: "openid email phone",

    // UPDATE: Just clean the URL parameters, don't force a path change here.
    // We will handle the redirect to /dashboard inside App.jsx
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider {...oidcConfig}>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>
);