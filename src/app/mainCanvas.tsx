'use client';

import * as THREE from 'three';
import { useEffect } from "react";
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';


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
            renderer.setAnimationLoop(animate)
            
            // Scene specific

            // Sky
            const sky = new Sky();
            sky.scale.setScalar(450000)

            const phi = THREE.MathUtils.degToRad(90);
            const theta = THREE.MathUtils.degToRad(180);
            const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi,theta);

            sky.material.uniforms.sunPosition.value = sunPosition;

            scene.add(sky)

            // Water plane (credit to Three.JS for water normal textures)

            const waterGeometry = new THREE.PlaneGeometry(10000,10000);

            const water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function(texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
				    distortionScale: 0.5,
				    fog: scene.fog !== undefined
                }
            )

            water.material.uniforms['size'].value = 5
            water.rotation.x = - Math.PI / 2;
            scene.add(water);


            const geometry = new THREE.BoxGeometry( 1, 1, 1 );
            const material = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)' ,transparent: true ,opacity: 0.6} );
            const cube = new THREE.Mesh( geometry, material );
            cube.position.y = 1;
    
            scene.add( cube );
            


			// const pmremGenerator = new THREE.PMREMGenerator( renderer );
			// const sceneEnv = new THREE.Scene();

			// sceneEnv.add( sky );
			// const renderTarget = pmremGenerator.fromScene( sceneEnv );
			// scene.add( sky );

			// scene.environment = renderTarget.texture;


            // Position camera

            camera.position.y = 2;
            camera.position.z = 5;

            // Rendering / Logic

            addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                renderer.render(scene,camera)
            })

            function animate(){

                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                cube.rotation.z += 0.01;

                render();
            }

            function render(){
                water.material.uniforms[ 'time' ].value += 0.5 / 60.0;
                renderer.render(scene, camera)
            }
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