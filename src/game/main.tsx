'use client';

import * as THREE from 'three/webgpu';
import gsap from 'gsap';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader, FontLoader } from 'three/examples/jsm/Addons.js';
import { pass, mrt, output, emissive } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let scene: THREE.Scene

let renderer: THREE.WebGPURenderer
let mainCanvas: HTMLCanvasElement;

let postProcessing: THREE.PostProcessing;


const smoothScroll = {y: 0}
const scrollTo = gsap.quickTo(smoothScroll, "y", {
  duration: 1,
  ease: "power3.out"
});

const cameraY = { y: 2 }

const dbUpTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }
const dbDownTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }

export function gemFinderGameMain() {

    smoothScroll.y = scrollY;

    const totalScroll = document.body.scrollHeight;

    mainCanvas = document.getElementById('mainScene') as HTMLCanvasElement

    if (mainCanvas != null) {
        const gltfLoader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        gltfLoader.setDRACOLoader( dracoLoader );

        const fontLoader = new FontLoader();

        // Initializer
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


        renderer = new THREE.WebGPURenderer({ 
            canvas: mainCanvas, 
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2;
        renderer.setAnimationLoop(animate)

        scene.background = new THREE.Color('rgb(21,21,21)')

        // Scene specific

        let tbaMesh : THREE.Mesh;

        fontLoader.load( '/fonts/JetBrainsMonoThin_Regular.json', function ( font ) {
            
            const fontMat = new THREE.MeshBasicMaterial({color: 'rgb(255,255,255)'})
            const fontTBAMat = new THREE.MeshBasicMaterial({color: 'rgb(255,255,255)', transparent: true})
            const headerFontSize = 0.4;

            const headerTopGeometry = new TextGeometry( 'Dream big..', {
                font: font,
                size: headerFontSize, 
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            } );

            headerTopGeometry.computeBoundingBox();
            const centerTop = headerTopGeometry.boundingBox.getCenter(new THREE.Vector3());

            const headerBottomGeometry = new TextGeometry( 'Acheive bigger..', {
                font: font,
                size: headerFontSize, 
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            } );

            headerBottomGeometry.computeBoundingBox();
            const centerBottom = headerBottomGeometry.boundingBox.getCenter(new THREE.Vector3());




            const meshTop = new THREE.Mesh(headerTopGeometry,fontMat)
            meshTop.position.x = -centerTop.x;
            meshTop.position.y = 3.8;
            meshTop.position.z = 1;

            const meshBottom = new THREE.Mesh(headerBottomGeometry,fontMat)
            meshBottom.position.x = -centerBottom.x;
            meshBottom.position.y = 0;
            meshBottom.position.z = 1;


            scene.add(meshTop);
            scene.add(meshBottom)


            // TBA 

            const tbaGeometry = new TextGeometry( 'TBA..', {
                font: font,
                size: headerFontSize, 
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            } );

            tbaGeometry.computeBoundingBox();
            const tbaCenter = tbaGeometry.boundingBox.getCenter(new THREE.Vector3())
            tbaMesh = new THREE.Mesh(tbaGeometry,fontTBAMat)

            tbaMesh.position.y = 2
            tbaMesh.position.z = -5
            tbaMesh.position.x -= tbaCenter.x;

            scene.add(tbaMesh)

        } );

        // Instantiate a gltfLoader


        let modelDBUp : GLTF;
        gltfLoader.load(
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

        let modelDBDown : GLTF;
        gltfLoader.load(
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
        const bloomPass = bloom(emissivePass, 0.15, .5);
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
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix()
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }

        function onScroll() {
            scrollTo(window.scrollY);
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

            const deltaDBCompletion = Math.min(1, (smoothScroll.y / (totalScroll * 0.05)))

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



            const deltaCamera = Math.min(1, Math.max(0,(smoothScroll.y / (totalScroll * 0.05) - 1)))
            const deltaTBAOpacity = Math.min(1, Math.max(0,(smoothScroll.y / (totalScroll * 0.05) - 1.5)))

            tbaMesh.material.opacity = deltaTBAOpacity;
            camera.position.z = 5 - 5*deltaCamera;



            render();
        }

        function render() {
            postProcessing.render();
        }

        addEventListener('resize', onResize)
        addEventListener('scroll', onScroll)
    }
}

