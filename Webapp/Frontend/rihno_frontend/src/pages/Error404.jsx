import React from 'react';
import {useNavigate} from "react-router-dom";
import Button from "../components/Button";

function Error404() {
    const navigate = useNavigate();
    return (
        <div className={"min-h-screen flex flex-col items-center justify-center gap-6 bg-white"}>
            <h1 className={"text-4xl font-mono"}>
                <span className={"bg-[#FFECA0]"}>4</span>
                <span className={"bg-[#FFA0A2]"}>0</span>
                <span className={"bg-[#7EA0FD]"}>4</span>
                <span className={"bg-[#CEFFBC]"}>!</span>
            </h1>
            <h2 className={"text-2xl font-mono bg-black text-white"}>Page Not Found</h2>
            <Button func={() => navigate("/")} color={"bg-[#7EA0FD]"} label={"Back to Home"} />
        </div>
    );
}

export default Error404;