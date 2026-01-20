import React, { useLayoutEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PresentationControls } from '@react-three/drei'; // Import this
import * as THREE from 'three';

const Model = () => {
    const obj = useLoader(OBJLoader, '/rihno.obj');

    useLayoutEffect(() => {
        obj.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material = new THREE.MeshStandardMaterial({
                    color: '#676767',
                    roughness: 0.1,
                    metalness: 0.9,
                });
            }
        });
    }, [obj]);

    return (
        // PresentationControls handles the dragging logic for you nicely.
        // global={false} ensures we only rotate when interacting with the model area (optional)
        // snap returns it to center (optional, remove if unwanted)
        // polar restricts vertical rotation so it doesn't flip upside down
        <PresentationControls
            speed={1.5}
            global={false} // Set to true if you want to drag anywhere on screen to rotate
            zoom={0.8}
            polar={[-0.1, Math.PI / 4]} // Limit vertical rotation
        >
            <primitive
                object={obj}
                scale={2}
                position={[0, 0, 0]}
            />
        </PresentationControls>
    );
};

export default Model;