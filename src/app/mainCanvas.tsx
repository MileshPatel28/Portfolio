'use client';

import * as THREE from 'three';
import { useEffect } from "react";
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';

// DEBUG:
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function MainCanvas() {
    useEffect(() => {
        
        const mainCanvas = document.getElementById('mainScene')

        if(mainCanvas != null){

            // Initializer
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

            const renderer = new THREE.WebGLRenderer({canvas: mainCanvas,alpha: true});
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.5;
            renderer.setSize( window.innerWidth, window.innerHeight );
            
            // Scene specific

            // Sky
            const sky = new Sky();
            sky.scale.setScalar(450000)

            const phi = THREE.MathUtils.degToRad(91);
            const theta = THREE.MathUtils.degToRad(180);
            const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi,theta);

            sky.material.uniforms.sunPosition.value = sunPosition;

            scene.add(sky)

            // Water plane (credit to Three.JS for water normal textures)

            const waterGeometry = new THREE.PlaneGeometry(1000,1000);

            const water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new THREE.TextureLoader().load('./waternormals.jpg', function(texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
				    distortionScale: 3.7,
				    fog: scene.fog !== undefined
                }
            )
            water.rotation.x = - Math.PI / 2;
            scene.add(water);


            const geometry = new THREE.BoxGeometry( 1, 1, 1 );
            const material = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)' } );
            const cube = new THREE.Mesh( geometry, material );
    
            scene.add( cube );
            





            // const controls = new OrbitControls( camera, renderer.domElement );
			// controls.maxPolarAngle = Math.PI * 0.495;
			// controls.target.set( 0, 10, 0 );
			// controls.minDistance = 40.0;
			// controls.maxDistance = 200.0;
			// controls.update();

            camera.position.y = 1;

            // Rendering / Logic
            renderer.render(scene, camera)
            addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                renderer.render(scene,camera)
            })

        }
        
    }, [])

    return(
        <canvas 
        id="mainScene" 
        style={{
            margin: '0 !important',
            padding: '0 !important',
            position: 'fixed'
        }}
        />
    )
}