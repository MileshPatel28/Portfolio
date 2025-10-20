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


let mouseX = 0;
let mouseY = 0;


const smoothScroll = { y: 0 }
const scrollTo = gsap.quickTo(smoothScroll, "y", {
    duration: 1,
    ease: "power3.out"
});

const cameraTransforms = { pX: 0, pY: 2, pZ: 5, rX: 0, rY: 0, rZ: 0 }

const dbUpTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }
const dbDownTransforms = { pX: 0, pY: 2, pZ: 0, rX: 0, rY: 0 }

export function canvasMain() {

    // ============================================= Init ============================================== //

    smoothScroll.y = scrollY;

    const totalScroll = document.body.scrollHeight;

    mainCanvas = document.getElementById('mainScene') as HTMLCanvasElement
    const mouseDiv = document.getElementById('mouseDiv') as HTMLDivElement

    if (mainCanvas != null) {
        const gltfLoader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('examples/jsm/libs/draco/');
        gltfLoader.setDRACOLoader(dracoLoader);

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

        let whoAmIMesh: THREE.Mesh;
        let topHeaderText: THREE.Mesh;
        let bottomHeaderText: THREE.Mesh;

        fontLoader.load('fonts/JetBrainsMonoThin_Regular.json', function (font) {

            const fontMat = new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)' })
            const fontWhoAmIMat = new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)', transparent: true })
            const headerFontSize = 0.4;

            const headerTopGeometry = new TextGeometry('Dream big..', {
                font: font,
                size: headerFontSize,
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            });

            headerTopGeometry.computeBoundingBox();
            const centerTop = headerTopGeometry.boundingBox?.getCenter(new THREE.Vector3());

            const headerBottomGeometry = new TextGeometry('Acheive bigger..', {
                font: font,
                size: headerFontSize,
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            });

            headerBottomGeometry.computeBoundingBox();
            const centerBottom = headerBottomGeometry.boundingBox?.getCenter(new THREE.Vector3());




            topHeaderText = new THREE.Mesh(headerTopGeometry, fontMat)
            if (centerTop) topHeaderText.position.x = -centerTop.x;
            topHeaderText.position.y = 3.8;
            topHeaderText.position.z = 1;

            bottomHeaderText = new THREE.Mesh(headerBottomGeometry, fontMat)
            if (centerBottom) bottomHeaderText.position.x = -centerBottom.x;
            bottomHeaderText.position.y = 0;
            bottomHeaderText.position.z = 1;


            scene.add(topHeaderText);
            scene.add(bottomHeaderText)


            // Who am I? 

            const whoAmIGeometry = new TextGeometry('Who am I?', {
                font: font,
                size: headerFontSize,
                depth: 0,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.005,
                bevelOffset: 0,
                bevelSegments: 3,
            });

            whoAmIGeometry.computeBoundingBox();
            const whoAmICenter = whoAmIGeometry.boundingBox?.getCenter(new THREE.Vector3())
            whoAmIMesh = new THREE.Mesh(whoAmIGeometry, fontWhoAmIMat)

            whoAmIMesh.position.y = 1.8
            whoAmIMesh.position.z = -5
            if (whoAmICenter) whoAmIMesh.position.x -= whoAmICenter.x;

            scene.add(whoAmIMesh)

        });

        // Instantiate a gltfLoader


        let modelDBUp: GLTF;
        gltfLoader.load(
            'models/DatabaseHaftUp.gltf',
            (gltf) => {
                modelDBUp = gltf;
                modelDBUp.scene.position.y += 2;
                scene.add(modelDBUp.scene);
            },
        );

        let modelDBDown: GLTF;
        gltfLoader.load(
            'models/DatabaseHaftDown.gltf',
            (gltf) => {
                modelDBDown = gltf;
                modelDBDown.scene.position.y += 2;
                scene.add(modelDBDown.scene);
            },
        );


        let modelBlackHole: GLTF;
        gltfLoader.load(
            'models/blackHole.gltf',
            (gltf) => {
                modelBlackHole = gltf;
                scene.add(modelBlackHole.scene)
            }
        )



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

        camera.position.y = cameraTransforms.pY;
        camera.position.z = cameraTransforms.pZ;

        

        mainCanvas.style.opacity = '0';
        gsap.to(mainCanvas, {
            opacity: 1,
            duration: 2,
            ease: 'expo.inOut',
        })

        // ============================================= Configuration for project ============================================== //

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

        function onMouseMove(event: MouseEvent) {
            if (event) {
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        }



        // ============================================= Animations ============================================== //



        const spaceWarpLines: THREE.Line[] = [];
        let lastLineSpawned = 0;

        const oldMousePos = new THREE.Vector2(mouseX,mouseY)

        function animate() {
            const globalScrollPercent = smoothScroll.y / totalScroll;
            const deltaDBCompletion = Math.min(1, (smoothScroll.y / (totalScroll * 0.05)))



            if(mouseDiv){
                mouseDiv.style.top = (mouseY - 25).toString() + 'px';
                mouseDiv.style.left = (mouseX - 25).toString() + 'px';

                const mouseDelta = new THREE.Vector2(mouseX - oldMousePos.x,oldMousePos.y - mouseY)
                const angle = mouseDelta.angle()*180/Math.PI

                const trailingVector = new THREE.Vector2(
                    -Math.sin(angle * Math.PI / 180),
                    -Math.cos(angle * Math.PI / 180)
                )

                // console.log(mouseDelta.angle()*180/Math.PI)

                oldMousePos.set(mouseX,mouseY)
            }



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


            if (globalScrollPercent >= 1 / 10) {
                modelDBUp.scene.visible = false;
                modelDBDown.scene.visible = false;

                topHeaderText.visible = false;
                bottomHeaderText.visible = false;


            }
            else {
                modelDBUp.scene.visible = true;
                modelDBDown.scene.visible = true;

                topHeaderText.visible = true;
                bottomHeaderText.visible = true;
            }


            // Blackhole Logic

            const blackHoleOpacity = gsap.utils.interpolate(
                [0, 0, 0, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], globalScrollPercent
            )

            const blackHoleInclination = gsap.utils.interpolate(
                [0, 0, 0, 0, 0, 0, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], globalScrollPercent
            )

            if (modelBlackHole) {
                modelBlackHole.scene.position.set(0, 2, -30);
                modelBlackHole.scene.lookAt(camera.position);
                modelBlackHole.scene.rotation.x = 0.1 * blackHoleInclination
                modelBlackHole.scene.rotation.z = 0.1 * blackHoleInclination

                modelBlackHole.scene.traverse((child) => {

                    if (child instanceof THREE.Mesh) {
                        modifyMaterial(child.material, (material) => {

                            material.transparent = true;
                            material.opacity = blackHoleOpacity
                            material.emissiveIntensity = blackHoleOpacity * 8 * (blackHoleOpacity >= 1 ? Math.max(1, Math.random() + 0.200) : 1);
                        })
                    }
                })
            }


            // const deltaCamera = Math.min(1, Math.max(0,(smoothScroll.y / (totalScroll * 0.05) - 0.35)))
            const whoAmIOpacity = gsap.utils.interpolate(
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], globalScrollPercent
            )

            if (whoAmIMesh) {
                modifyMaterial(whoAmIMesh.material, (material) => {
                    material.opacity = whoAmIOpacity;
                })
            }



            // Camera transforms
            cameraTransforms.pX = gsap.utils.interpolate(
                [0, 0, 0, 15, 15, 15, 15, 15, 15, 15], globalScrollPercent
            )

            cameraTransforms.pY = gsap.utils.interpolate(
                [2, 2, 2, -10, -10, -10, -10, 10, 10, 10], globalScrollPercent
            )
            cameraTransforms.pZ = gsap.utils.interpolate(
                [5, 0, 0, 40, 40, 40, 40, 40, 40, 40], globalScrollPercent
            )

            cameraTransforms.rY = gsap.utils.interpolate(
                [0, 0, 0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7], globalScrollPercent
            )




            camera.position.x = cameraTransforms.pX;
            camera.position.y = cameraTransforms.pY
            camera.position.z = cameraTransforms.pZ;

            // Adjust depending on percentage of scroll instead of camera
            const cameraShakeConstant = 250;

            camera.rotation.x = (cameraTransforms.rY >= 0.7 ? Math.random() / cameraShakeConstant : 0)
            camera.rotation.y = cameraTransforms.rY + (cameraTransforms.rY >= 0.7 ? Math.random() / cameraShakeConstant : 0);
            camera.rotation.z = (cameraTransforms.rY >= 0.7 ? Math.random() / cameraShakeConstant : 0)

            // Must fix

            const movementConstant = 0.125;

            //  mouseX = ((event.clientX / window.innerWidth) - 0.5) * movementConstant;
            //     mouseY = -((event.clientY / window.innerWidth) - 0.5) * movementConstant;

            if (camera.position.z == 5) {
                camera.lookAt(new THREE.Vector3(
                    ((mouseX/ window.innerWidth) - 0.5) * movementConstant,
                    2 - ((mouseY / window.innerWidth) - 0.5) * movementConstant
                    , 
                    0
                ));
            }

            if (cameraTransforms.rY >= 0.5) {

                if (Date.now() - lastLineSpawned % 125) {

                    lastLineSpawned = Date.now();

                    const randomX = getRandomArbitrary(-250, 30)
                    const randomY = getRandomArbitrary(-140, 140)
                    const initZ = -300;

                    const lineMat = new THREE.LineBasicMaterial({
                        color: 'rgba(64, 147, 255, 1)'
                    });


                    const points = [];
                    points.push(new THREE.Vector3(randomX, randomY, initZ));
                    points.push(new THREE.Vector3(randomX, randomY, initZ + 10));

                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(lineGeo, lineMat)

                    scene.add(line);
                    spaceWarpLines.push(line)


                }

            }

            for (let i = 0; i < spaceWarpLines.length; i++) {
                const line = spaceWarpLines[i];

                line.position.z += 10;

                if (line.position.z <= -10) {
                    scene.remove(line)
                    spaceWarpLines.splice(i, 1);
                    i--;
                }
            }




            render();
        }

        function render() {
            postProcessing.render();
        }

        addEventListener('resize', onResize)
        addEventListener('scroll', onScroll)
        addEventListener('mousemove', onMouseMove)
    }
}


function modifyMaterial(
    mat: THREE.Material | THREE.Material[],
    materialModifyCallback: (material: THREE.MeshStandardMaterial) => void
) {
    if (Array.isArray(mat)) {
        materialModifyCallback(mat[0] as THREE.MeshStandardMaterial)
    } else {
        materialModifyCallback(mat as THREE.MeshStandardMaterial)
    }
}


// Code from : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}