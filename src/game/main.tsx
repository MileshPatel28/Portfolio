'use client';

import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import * as THREE from 'three';
import gsap from 'gsap';

let scene: THREE.Scene
let scenePageBody: THREE.Scene

let renderer: THREE.WebGLRenderer
let mainCanvas: HTMLCanvasElement;

const cameraY = { y: 5 }

export function gemFinderGameMain() {

    mainCanvas = document.getElementById('mainScene') as HTMLCanvasElement

    if (mainCanvas != null) {

        // Initializer
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, alpha: true });
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.2;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animate)

        // Scene specific

        // Sky
        const sky = new Sky();
        sky.scale.setScalar(450000)

        const phi = THREE.MathUtils.degToRad(91);
        const theta = THREE.MathUtils.degToRad(180);
        const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);

        sky.material.blendColor = new THREE.Color().setRGB(0, 0, 1)
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



        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMat = new THREE.MeshBasicMaterial({ color: 'rgba(35, 150, 232, 1)' })
        const cube = new THREE.Mesh(cubeGeometry, cubeMat)

        cube.position.y = -5;
        cube.position.x = -3;
        cube.position.z = -3;

        scene.add(cube)



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

        function onScroll() {
            const targetY = 2 - (scrollY / document.body.scrollHeight) * 32 ;
            const targetOpacity = Math.abs((1 - (scrollY / document.body.scrollHeight) * 20))

            // console.log(scrollY)
            console.log(targetOpacity);

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
            // camera.position.y = 2 - scrollY/document.body.scrollHeight*8
            render();
        }

        function render() {
            water.material.uniforms['time'].value += 0.5 / 60.0;
            renderer.render(scene, camera)
        }

        addEventListener('resize', onResize)
        addEventListener('scroll', onScroll)
    }
}

