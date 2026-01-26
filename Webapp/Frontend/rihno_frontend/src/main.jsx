import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from "react-oidc-context"
import { router } from "./routes/routes.jsx"
import { cognitoConfig } from "./authConfig.js";
import './index.css'

// AWS Cognito Authentication Configuration
const oidcConfig = {
    authority: cognitoConfig.authority,
    client_id: cognitoConfig.client_id,
    redirect_uri: cognitoConfig.redirect_uri,
    response_type: "code",
    scope: "openid email phone",

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