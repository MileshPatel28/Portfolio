'use client';

import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
// import * as THREE from 'three';
import * as THREE from 'three/webgpu';
// import * as THREEGPU from 'three/webgpu';
import gsap from 'gsap';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { color, mod } from 'three/tsl';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { Scene } from 'three/src/Three.WebGPU.Nodes.js';
import { pass, mrt, output, emissive } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

let scene: THREE.Scene

let renderer: THREE.WebGPURenderer
let mainCanvas: HTMLCanvasElement;

let postProcessing : THREE.PostProcessing;

const cameraY = { y: 2 }

export function gemFinderGameMain() {

    mainCanvas = document.getElementById('mainScene') as HTMLCanvasElement

    if (mainCanvas != null) {

        // Initializer
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


        renderer = new THREE.WebGPURenderer({ canvas: mainCanvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMappingExposure = 0.2;
        renderer.setAnimationLoop(animate)

        scene.background = new THREE.Color('rgb(21,21,21)')

        // Scene specific

        const cubeGeometry = new THREE.BoxGeometry(1,1,1);
        const cubeMaterial = new THREE.MeshBasicMaterial({color: 'rgba(146, 146, 146, 1)'})
        const cube = new THREE.Mesh(cubeGeometry,cubeMaterial)

        scene.add(cube)

        // const light = new THREE.PointLight( 'rgba(96, 168, 255, 1)', 200, 100 );
        // light.position.set( 0, 2, 3 );
        // scene.add( light );


        // Instantiate a loader
        const loader = new GLTFLoader();

        let modelDBUp;
        loader.load(
            'models/DatabaseHaftUp.gltf',
            function ( gltf ) {
                modelDBUp = gltf;
                modelDBUp.scene.position.y += 2;
                scene.add( modelDBUp.scene );
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An error happened' );
            }
        );

        let modelDBDown;
        loader.load(
            'models/DatabaseHaftDown.gltf',
            function ( gltf ) {
                modelDBDown = gltf;
                modelDBDown.scene.position.y += 2;
                scene.add( modelDBDown.scene );
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An error happened' );
            }
        );




		const scenePass = pass( scene, camera );
		scenePass.setMRT( mrt( {
			output,
			emissive
		} ) );

        
		const outputPass = scenePass.getTextureNode();
		const emissivePass = scenePass.getTextureNode( 'emissive' );
		const bloomPass = bloom( emissivePass, 0.25, .5 );
		postProcessing = new THREE.PostProcessing( renderer );
		postProcessing.outputNode = outputPass.add( bloomPass );       


        // Position camera

        camera.position.y = cameraY.y;
        camera.position.z = 5;

        // Rendering / Logic

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }

        function onScroll() {
            const targetY = 2 - (scrollY / document.body.scrollHeight) * 32 ;
            const targetOpacity = Math.abs((1 - (scrollY / document.body.scrollHeight) * 20))


            // Swap scenes

            gsap.to(cameraY, {
                y: targetY,
                duration: 0.25,
                ease: 'power2.out',
            })

            gsap.to(mainCanvas, {
                opacity: targetOpacity,
                duration: 0.25,
                ease: 'power2.out',
            })

        }


        function animate() {
            camera.position.y = cameraY.y

            // if(modelDBUp){
            //     modelDBUp.scene.position.y += 0.01;
            // }

            render();
        }

        function render() {
            // renderer.render(scene, camera)
            postProcessing.render();
        }

        addEventListener('resize', onResize)
        addEventListener('scroll', onScroll)
    }
}

