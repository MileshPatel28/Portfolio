'use client';

import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import * as THREE from 'three';
import { deprecate } from 'util';

let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let mainCanvas;


export function gemFinderGameMain() {

    mainCanvas = document.getElementById('mainScene')

    if (mainCanvas != null) {

        // Initializer
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, alpha: true });
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animate)

        // Scene specific

        // Sky
        const sky = new Sky();
        sky.scale.setScalar(450000)

        const phi = THREE.MathUtils.degToRad(91);
        const theta = THREE.MathUtils.degToRad(180);
        const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms.sunPosition.value = sunPosition;

        scene.add(sky)

        // Water plane (credit to Three.JS for water normal textures)

        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function (texture) {
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




        // Generate mountains


        // Position camera

        camera.position.y = 2;
        camera.position.z = 0;

        camera.rotation.x = 0;
        camera.rotation.y = 0.5;

        // Rendering / Logic



        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }


        function animate() {

            camera.position.y = 2 - scrollY/document.body.scrollHeight*8

            render();
        }

        function render() {
            water.material.uniforms['time'].value += 0.5 / 60.0;
            renderer.render(scene, camera)
        }

        addEventListener('resize', onResize)
    }
}


// Use NoiseMap to generate w/ static middle
// Map will be limited to drone's range (w/ static out)
// Need to fix lol
function generateMap() {

    const vertexTmp = [];
    const vertexVectors = [];

    const start = -100;
    const end = 100;

    for (let x = start; x < end; x++ ) {
        for (let z = start; z < end; z++) {
            const randomY = Math.random() * 5 - 3.5;

            vertexTmp.push(x, randomY, z);
            vertexVectors.push(new THREE.Vector3(x,randomY,z))
        }
    }

    console.log(vertexTmp.length)
    
    const widthMap = end-start;
    const indicesTmp = [];

    for(let p = 0; p < vertexVectors.length - widthMap; p++){

        if(p < widthMap*widthMap){
            if(p % 2 == 0){
                indicesTmp.push(
                    p, p + widthMap, p + 1,
                )

                if(p % widthMap != 0){
                    indicesTmp.push(
                        p, p + widthMap, p - 1
                    )
                }
            }
            else {
                indicesTmp.push(
                    p, p + widthMap, p + widthMap - 1
                )

                if((p + 1) % widthMap != 0){
                    indicesTmp.push(
                        p, p + widthMap,p + widthMap + 1
                    )
                }

            }
        }
    }

    const vertices = new Float32Array(vertexTmp);

    // const indices = new Uint16Array([
    //     0, 1, 2,  // Triangle 1: A -> B -> C
    //     2, 1, 3   // Triangle 2: C -> B -> D
    // ]);
    const indices = new Uint16Array(indicesTmp);

    // UV-Coordinates
    const uvs = new Float32Array([
        0, 0,  // UV A
        0, 1,  // UV B
        1, 0,  // UV C
        1, 1   // UV D
    ]);

    //BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    //   const texture = new THREE.TextureLoader().load("https://threejs.org/examples/textures/uv_grid_opengl.jpg");
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 'rgba(171, 212, 255, 0.47)', transparent: true, opacity: 0.6 });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}