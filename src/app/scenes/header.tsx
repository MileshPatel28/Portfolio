'use client';

import * as THREE from 'three';
import { useEffect } from "react";

export default function HeaderCanvas() {
    useEffect(() => {
        
        const mainCanvas = document.getElementById('mainScene')

        if(mainCanvas != null){
        

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer({canvas: mainCanvas});
        renderer.setSize( window.innerWidth, window.innerHeight );
        
        
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)' } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
        
        camera.position.z = 5;

        renderer.render(scene, camera)
        }
        
    }, [])

    return(
    <canvas id="mainScene" style={{background: 'rgb(21,21,21)', width: '100%' }}>

    </canvas>
    )
}