'use client';

import Image from "next/image";
import { useEffect } from "react";
import * as THREE from 'three';

export default function Home() {

  useEffect(() => {

    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    
    const mainCanvas = document.getElementById('mainScene')
    if(mainCanvas != null){
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

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
     Milesh Patel
     <canvas id="mainScene" style={{background: 'rgb(21,21,21)'}}>

     </canvas>
    </div>
  );
}
