import React from 'react';
import { useAuth } from "react-oidc-context";
// Import your config if you created the file, otherwise the fallback values below handle it
import { cognitoConfig } from "../authConfig.js";

function Dashboard() {
    const auth = useAuth();

    const signOutRedirect = async () => {
        // 1. Clear the local browser session first
        await auth.removeUser();

        // 2. Define configuration (Matches your AWS Console)
        const clientId = cognitoConfig?.client_id;
        const logoutUri = cognitoConfig?.redirect_uri;
        const cognitoDomain = cognitoConfig?.domain;

        // 3. Redirect to AWS Cognito Logout URL
        window.location.href =
            `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
            <h1 className="text-4xl font-black underline">Dashboard</h1>

            <p className="font-mono text-lg text-center">
                Logged in as:<br/>
                <b className="text-xl">{auth.user?.profile?.email}</b>
            </p>

            <button
                onClick={signOutRedirect}
                className="bg-red-300 border-[4px] border-black px-10 py-3 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Logout
            </button>
        </div>
    );
}

export default Dashboard;