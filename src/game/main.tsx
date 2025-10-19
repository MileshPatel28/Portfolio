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

let postProcessing: THREE.PostProcessing;

let needRender = true;

const cameraY = { y: 2 }

const dbUpTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }
const dbDownTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }

export function gemFinderGameMain() {

    const totalScroll = document.body.scrollHeight;

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

        const cubeGeometry = new THREE.BoxGeometry(20, 1, 8);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 'rgba(26, 26, 26, 1)' })
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

        scene.add(cube)

        // const light = new THREE.PointLight( 'rgba(96, 168, 255, 1)', 200, 100 );
        // light.position.set( 0, 2, 3 );
        // scene.add( light );


        // Instantiate a loader
        const loader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );

        let modelDBUp;
        loader.load(
            'models/DatabaseHaftUp.gltf',
            function (gltf) {
                modelDBUp = gltf;
                modelDBUp.scene.position.y += 2;
                scene.add(modelDBUp.scene);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );

        let modelDBDown;
        loader.load(
            'models/DatabaseHaftDown.gltf',
            function (gltf) {
                modelDBDown = gltf;
                modelDBDown.scene.position.y += 2;
                scene.add(modelDBDown.scene);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );




        const scenePass = pass(scene, camera);
        scenePass.setMRT(mrt({
            output,
            emissive
        }));


        const outputPass = scenePass.getTextureNode();
        const emissivePass = scenePass.getTextureNode('emissive');
        const bloomPass = bloom(emissivePass, 0.25, .5);
        postProcessing = new THREE.PostProcessing(renderer);
        postProcessing.outputNode = outputPass.add(bloomPass);


        // Position camera

        camera.position.y = cameraY.y;
        camera.position.z = 5;

        // Rendering / Logic

        mainCanvas.style.opacity = '0';
        gsap.to(mainCanvas, {
            opacity: 1,
            duration: 2,
            ease: 'expo.inOut',
        })

        function onResize() {
            needRender = true;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }

        function onScroll() {
            needRender = true;
            const targetY = 2 - (scrollY / totalScroll) * 32;
            const targetOpacity = Math.abs((1 - (scrollY / totalScroll) * 20))

            // const deltaDBCompletion = Math.min(1, (scrollY / (totalScroll * 0.1)))

            // dbUpTransforms.pX = -1.5 * deltaDBCompletion
            // dbUpTransforms.pY = 2 + .3 * deltaDBCompletion
            // dbUpTransforms.pZ = 0.4 * deltaDBCompletion
            // dbUpTransforms.rX = 0.4 * deltaDBCompletion
            // dbUpTransforms.rY = -0.4 * deltaDBCompletion

            // dbDownTransforms.pX = 1.5 * deltaDBCompletion
            // dbDownTransforms.pZ = 0.4 * deltaDBCompletion
            // dbDownTransforms.rX = -0.4 * deltaDBCompletion
            // dbDownTransforms.rY = 0.4 * deltaDBCompletion

            // Swap scenes

            // gsap.to(cameraY, {
            //     y: targetY,
            //     duration: 0.25,
            //     ease: 'power2.out',
            // })




            // gsap.to(dbUpTransforms,{
            //         pX: -1.5*deltaDBCompletion,
            //         pY: 2 + .3*deltaDBCompletion,
            //         pZ: 0.4*deltaDBCompletion,
            //         rX: 0.4*deltaDBCompletion,
            //         rY: -0.4*deltaDBCompletion
            // })

            // gsap.to(dbDownTransforms,{
            //         pX: 1.5*deltaDBCompletion,
            //         pZ: 0.4*deltaDBCompletion,
            //         rX: -0.4*deltaDBCompletion,
            //         rY: 0.4*deltaDBCompletion
            // })


            // gsap.to(modelDBDown.scene.position,{
            //         x: 1.5*deltaDBCompletion,
            //         z: 0.4*deltaDBCompletion
            // })
            // gsap.to(modelDBDown.scene.rotation,{
            //     x: -0.4*deltaDBCompletion,
            //     y: 0.4*deltaDBCompletion
            // })



            // // Performance code version:
            //  if(modelDBUp){
            //     modelDBUp.scene.position.x = -1.5*deltaDBCompletion;
            //     modelDBUp.scene.position.y = 2 + 0.3*deltaDBCompletion;
            //     modelDBUp.scene.position.z = 0.4*deltaDBCompletion;

            //     modelDBUp.scene.rotation.x = 0.4*deltaDBCompletion;
            //     modelDBUp.scene.rotation.y = -0.4*deltaDBCompletion;
            // }

            // if(modelDBDown){
            //     modelDBDown.scene.position.x = 1.5*deltaDBCompletion;
            //     modelDBDown.scene.position.y = 2;
            //     modelDBDown.scene.position.z = 0.4*deltaDBCompletion;

            //     modelDBDown.scene.rotation.x = -0.4*deltaDBCompletion;
            //     modelDBDown.scene.rotation.y = 0.4*deltaDBCompletion;
            // }


        }


        function animate() {
            camera.position.y = cameraY.y

            // Good end pos
            // if(modelDBUp){
            //     modelDBUp.scene.position.x = -1.5;
            //     modelDBUp.scene.position.y = 2.3;
            //     modelDBUp.scene.position.z = 0.4;

            //     modelDBUp.scene.rotation.x = 0.4;
            //     modelDBUp.scene.rotation.y = -0.4;
            // }

            // if(modelDBDown){
            //     modelDBDown.scene.position.x = 1.5;
            //     modelDBDown.scene.position.y = 2;
            //     modelDBDown.scene.position.z = 0.4;

            //     modelDBDown.scene.rotation.x = -0.4;
            //     modelDBDown.scene.rotation.y = 0.4;
            // }

            const deltaDBCompletion = Math.min(1, (scrollY / (totalScroll * 0.1)))

            dbUpTransforms.pX = -1.5 * deltaDBCompletion
            dbUpTransforms.pY = 2 + .3 * deltaDBCompletion
            dbUpTransforms.pZ = 0.4 * deltaDBCompletion
            dbUpTransforms.rX = 0.4 * deltaDBCompletion
            dbUpTransforms.rY = -0.4 * deltaDBCompletion

            dbDownTransforms.pX = 1.5 * deltaDBCompletion
            dbDownTransforms.pZ = 0.4 * deltaDBCompletion
            dbDownTransforms.rX = -0.4 * deltaDBCompletion
            dbDownTransforms.rY = 0.4 * deltaDBCompletion

            if (modelDBUp) {
                modelDBUp.scene.position.x = dbUpTransforms.pX;
                modelDBUp.scene.position.y = dbUpTransforms.pY;
                modelDBUp.scene.position.z = dbUpTransforms.pZ;

                modelDBUp.scene.rotation.x = dbUpTransforms.rX;
                modelDBUp.scene.rotation.y = dbUpTransforms.rY;
            }

            if (modelDBDown) {
                modelDBDown.scene.position.x = dbDownTransforms.pX;
                modelDBDown.scene.position.y = 2;
                modelDBDown.scene.position.z = dbDownTransforms.pZ;

                modelDBDown.scene.rotation.x = dbDownTransforms.rX;
                modelDBDown.scene.rotation.y = dbDownTransforms.rY;
            }

            render();
        }

        function render() {
            // renderer.render(scene, camera)
            if(!needRender) return;
            postProcessing.render();
            needRender = false;
        }

        addEventListener('resize', onResize)
        addEventListener('scroll', onScroll)
    }
}

