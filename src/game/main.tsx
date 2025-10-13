'use client';

import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import * as THREE from 'three';

let scene: THREE.Scene
let renderer : THREE.WebGLRenderer
let mainCanvas;


export function gemFinderGameMain(){
            
        mainCanvas = document.getElementById('mainScene')

        if(mainCanvas != null){

            // Initializer
            scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

            renderer = new THREE.WebGLRenderer({canvas: mainCanvas,alpha: true});
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.5;
            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.setAnimationLoop(animate)
            
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
            
            // Generate mountains

            generateMap();

            // Position camera

            camera.position.y = 3;
            camera.position.z = 5;

            camera.rotation.x = -0.2;

            // Rendering / Logic

            

            function onResize(){
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                renderer.render(scene,camera)
            }


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

            addEventListener('resize',onResize)
        }
}


// Use NoiseMap to generate w/ static middle
// Map will be limited to drone's range (w/ static out)
// Need to fix lol
function generateMap(){
    const verticies = [];

    verticies.push(new THREE.Vector3(-10,0,-10))
    for(let x = -10 + 1; x <= 10; x++){
        for(let z = -10 + 1; z <= 10; z++){
            verticies.push(new THREE.Vector3(-10,Math.random() * 10 - 5,-10))
        }
    }
    verticies.push(new THREE.Vector3(-10,0,-10))

    const geometry = new THREE.BufferGeometry().setFromPoints(verticies);
    const material = new THREE.MeshBasicMaterial({color: 'rgb(255,255,255)'})
    const customShape = new THREE.Mesh(geometry,material);

    scene.add(customShape);
}