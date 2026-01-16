import React from 'react';
import logo from '../assets/rihno.svg';

function NavBar() {
    return (
        <div className="max-w-10xl mx-auto flex flex-col gap-6">
            <nav className="flex items-center justify-between border-[6px] border-black p-2 pr-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="h-16 w-16" />
                    <span className="text-2xl font-black underline decoration-4 underline-offset-4">
                        RIHNO
                    </span>
                </div>

                {/* Links + Auth Button */}
                <div className="flex items-center gap-8 font-bold text-lg">
                    <a href="#" className="border-b-0 hover:border-b-[4px] hover:border-[#FFECA0]">
                        Contact
                    </a>
                    <a href="#" className="border-b-0 hover:border-b-[4px] hover:border-[#FFECA0]">
                        About
                    </a>
                    <a href="#" className="border-b-0 hover:border-b-[4px] hover:border-[#FFECA0]">
                        Documentation
                    </a>


                        <button className="bg-[#FFECA0] border-[4px] border-black px-8 py-2 font-black uppercase
                                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                       active:translate-x-[2px] active:translate-y-[2px]
                                       active:shadow-none transition-all">
                            Login
                        </button>
                </div>
            </nav>
        </div>
    );
}

export default NavBar;