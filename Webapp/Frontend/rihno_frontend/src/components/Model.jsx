import React, { useLayoutEffect, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const Model = () => {
    const obj = useLoader(OBJLoader, '/rihno.obj');
    const { viewport } = useThree();

    // Calculate responsive scale and position based on viewport width
    // On mobile (width < 768px), we make the model smaller and center it.
    const isMobile = viewport.width < 5;
    const responsiveScale = isMobile ? 1.2 : 2;
    const responsivePosition = isMobile ? [0, -0.5, 0] : [0, 0, 0];

    useLayoutEffect(() => {
        obj.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: '#676767',
                    roughness: 0.1,
                    metalness: 0.9,
                });
            }
        });
    }, [obj]);

    return (
        <PresentationControls
            speed={1.5}
            global={false}
            zoom={0.8}
            polar={[-0.1, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Added horizontal limit for better UX
        >
            <primitive
                object={obj}
                scale={responsiveScale}
                position={responsivePosition}
            />
        </PresentationControls>
    );
};

export default Model;