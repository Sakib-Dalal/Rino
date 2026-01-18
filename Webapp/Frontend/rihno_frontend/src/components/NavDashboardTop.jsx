import React from 'react';
import logo from "../assets/rihno.svg";
import {Link} from "react-router-dom";
import Button from "./Button.jsx";
import { useAuth } from "react-oidc-context";
// Import your config if you created the file, otherwise the fallback values below handle it
import { cognitoConfig } from "../authConfig.js";


function NavDashboardTop() {
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
        <div className="max-w-10xl mx-auto p-4">
            <nav className="flex items-center justify-between border-[6px] border-black p-2 pr-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

                <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="h-16 w-16 rounded-full" />
                    <span className="text-2xl font-black underline"><Link to={'/'}>RIHNO</Link></span>
                </div>

                <div className="flex items-center gap-6 font-bold text-lg">
                    <p className="font-mono text-lg text-center bg-black">
                        <b className="text-xl text-white p-1">{auth.user?.profile?.email}</b>
                    </p>

                    <button
                        onClick={signOutRedirect}
                        className="bg-red-300 border-[4px] border-black px-10 py-3 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Logout
                    </button>
                </div>
            </nav>
        </div>

    );
}

export default NavDashboardTop;