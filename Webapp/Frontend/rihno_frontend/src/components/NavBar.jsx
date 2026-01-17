import React from 'react';
import logo from '../assets/rihno.svg';
import { Link } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
// If you created the authConfig file, keep the import.
// If not, the hardcoded values below will work as a fallback.
import { cognitoConfig } from "../authConfig.js";

import Button from "./Button";

function NavBar() {
    const auth = useAuth();

    const signOutRedirect = async () => {
        // 1. CLEAR LOCAL TOKENS FIRST
        await auth.removeUser();

        // 2. DEFINE CONFIG (Ensure these match your authConfig.js or hardcoded values)
        // We use the imported config if available, or fall back to strings for safety
        const clientId = cognitoConfig?.client_id || "35ijbep5e36sjm2ju660mr128q";
        const logoutUri = cognitoConfig?.redirect_uri || "http://localhost:5173/";
        const cognitoDomain = cognitoConfig?.domain || "https://ap-south-1l7dchhxpa.auth.ap-south-1.amazoncognito.com";

        // 3. REDIRECT TO COGNITO LOGOUT
        window.location.href =
            `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    return (
        <div className="max-w-10xl mx-auto">
            <nav className="flex items-center justify-between border-[6px] border-black p-2 pr-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

                <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="h-16 w-16 rounded-full" />
                    <span className="text-2xl font-black underline">RIHNO</span>
                </div>

                <div className="flex items-center gap-6 font-bold text-lg">
                    <Link to="/" className={"border-b-0 hover:border-b-[4px] hover:border-[#FFECA0] font-mono"}>Home</Link>
                    <Link to="/contact" className={"border-b-0 hover:border-b-[4px] hover:border-[#CEFFBC] font-mono"}>Contact</Link>
                    <Link to="/about" className={"border-b-0 hover:border-b-[4px] hover:border-[#FFA0A2] font-mono"}>About</Link>
                    <Link to="/documentation" className={"border-b-0 hover:border-b-[4px] hover:border-[#7EA0FD] font-mono"}>Documentation</Link>

                    {auth.isAuthenticated && (
                        <span className="text-sm font-mono bg-black text-white px-3 py-1">
                            {auth.user?.profile?.email}
                        </span>
                    )}

                    {!auth.isAuthenticated ? (
                        // <button
                        //     onClick={() => auth.signinRedirect()}
                        //     className="bg-[#FFECA0] border-[4px] border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        //     Login
                        // </button>
                        <Button func={() => auth.signinRedirect()} color={"bg-[#FFECA0]"} label="LOGIN" />
                    ) : (
                        // <button
                        //     onClick={signOutRedirect}
                        //     className="bg-red-300 border-[4px] border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        //     Logout
                        // </button>
                        <Button func={signOutRedirect} color={"bg-red-300"} label="LOGOUT" />
                )}
                </div>
            </nav>
        </div>
    );
}

export default NavBar;