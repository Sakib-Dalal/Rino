import React from 'react';
import logo from '../assets/rihno.svg';
import { Link } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { cognitoConfig } from "../authConfig.js";
import Button from "./Button";

function NavBar() {
    const auth = useAuth();

    const signOutRedirect = async () => {
        await auth.removeUser();
        const clientId = cognitoConfig?.client_id;
        const logoutUri = cognitoConfig?.redirect_uri;
        const cognitoDomain = cognitoConfig?.domain;
        window.location.href =
            `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    return (
        // ADDED: relative and z-50 to ensure this sits ON TOP of the 3D Canvas
        <div className="max-w-10xl mx-auto relative z-50">
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
                        <Button func={() => auth.signinRedirect()} color={"bg-[#FFECA0]"} label="LOGIN" />
                    ) : (
                        <Button func={signOutRedirect} color={"bg-red-300"} label="LOGOUT" />
                    )}
                </div>
            </nav>
        </div>
    );
}

export default NavBar;