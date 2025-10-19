'use client';


import { useEffect } from "react";
import {gemFinderGameMain} from "../game/main"

export default function MainCanvas() {
    useEffect(() => {
        gemFinderGameMain();
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
