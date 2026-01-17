import React from 'react';

function Button(props) {
    return (
        <div>
            <button
                onClick={() => props.func()}
                className= {`${props.color} border-[4px] border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}>
                {props.label}
            </button>
        </div>
    );
}

export default Button;