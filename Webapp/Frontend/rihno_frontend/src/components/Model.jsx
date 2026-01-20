import React, { useLayoutEffect, useRef } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PresentationControls, useScroll } from '@react-three/drei'; // Added useScroll
import * as THREE from 'three';

const Model = () => {
    const obj = useLoader(OBJLoader, '/rihno.obj');
    const scroll = useScroll(); // Access scroll data
    const modelRef = useRef();

    useFrame(() => {
        // r1 is a value from 0 to 1 based on scroll progress
        const r1 = scroll.range(0, 1);

        if (modelRef.current) {
            // SCROLL UP (r1 = 0): Position is [0, 0, 0]
            // SCROLL DOWN (r1 = 1): Change axis values here
            // Example: Move to X: 2, Y: -1, Z: -3 as user scrolls down
            modelRef.current.position.x = THREE.MathUtils.lerp(2, 1.3, r1);
            modelRef.current.position.y = THREE.MathUtils.lerp(0.2, 0.2, r1);
            modelRef.current.position.z = THREE.MathUtils.lerp(0.5, 0.5, r1);

            // Optional: Rotate while scrolling
            modelRef.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, r1);
        }
    });

    useLayoutEffect(() => {
        obj.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: '#676767',
                    roughness: 0.0,
                    metalness: 0.9,
                });
            }
        });
    }, [obj]);

    return (
        <PresentationControls
            speed={1.5}
            global={false}
            polar={[-0.1, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
            <group ref={modelRef}>
                <primitive
                    object={obj}
                    scale={2} // Using fixed scale for clarity during movement
                />
            </group>
        </PresentationControls>
    );
};

export default Model;