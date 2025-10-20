'use client';


import { useEffect } from "react";
import { canvasMain } from "./game/main";

export default function MainCanvas() {
    useEffect(() => {
        canvasMain();
    }, [])

    return(
        <canvas 
        id="mainScene" 
        style={{
            margin: '0 !important',
            padding: '0 !important',
            position: 'fixed',
            zIndex: '-10'
        }}
        />
    )
}
