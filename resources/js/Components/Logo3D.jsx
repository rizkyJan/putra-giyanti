import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, PresentationControls, useGLTF } from "@react-three/drei";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/logo-putra-giyanti.glb";

function LogoModel({ reduceMotion }) {
    const group = useRef(null);
    const { scene: originalScene } = useGLTF(MODEL_URL);

    const scene = useMemo(() => {
        if (!originalScene) return new THREE.Scene();
        const clonedScene = originalScene.clone(true);

        clonedScene.traverse((object) => {
            if (!object.isMesh) return;
            const oldMaterial = object.material;
            const materialName = oldMaterial?.name?.toLowerCase() ?? "";
            const map = oldMaterial?.map ?? null;

            if (map) {
                map.colorSpace = THREE.SRGBColorSpace;
                map.anisotropy = 1;
                map.needsUpdate = true;
            }

            if (materialName.includes("gold")) {
                object.material = new THREE.MeshStandardMaterial({
                    color: "#f4b73b",
                    metalness: 0.6,
                    roughness: 0.3,
                });
                return;
            }

            if (
                materialName.includes("edge") ||
                object.name === "edge" ||
                object.name === "back"
            ) {
                object.material = new THREE.MeshStandardMaterial({
                    color: "#52070c",
                    metalness: 0.2,
                    roughness: 0.4,
                });
                return;
            }

            object.material = new THREE.MeshStandardMaterial({
                map,
                color: "#ffffff",
                transparent: oldMaterial?.transparent ?? false,
                opacity: oldMaterial?.opacity ?? 1,
                alphaTest: oldMaterial?.alphaTest ?? 0,
                side: oldMaterial?.side ?? THREE.FrontSide,
                metalness: 0.1,
                roughness: 0.3,
            });
        });

        return clonedScene;
    }, [originalScene]);

    useEffect(() => {
        return () => {
            scene.traverse((object) => {
                if (!object.isMesh) return;
                object.material?.dispose?.();
            });
        };
    }, [scene]);

    useFrame((state, delta) => {
        if (!group.current || reduceMotion) return;
        const time = state.clock.getElapsedTime();
        const targetRotationY =
            state.pointer.x * 0.15 + Math.sin(time * 0.52) * 0.035;
        const targetRotationX = -state.pointer.y * 0.08 + 0.025;
        const easing = Math.min(1, delta * 3.8);

        group.current.rotation.y +=
            (targetRotationY - group.current.rotation.y) * easing;
        group.current.rotation.x +=
            (targetRotationX - group.current.rotation.x) * easing;
        group.current.position.y = Math.sin(time * 0.85) * 0.045;
    });

    return (
        <group
            ref={group}
            scale={0.94}
            position={[0, -0.02, 0]}
            rotation={[0.025, 0, 0]}
        >
            <primitive object={scene} />
        </group>
    );
}

function ModelLoader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3 text-white/70">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-300" />
                <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em]">
                    Memuat logo
                </span>
            </div>
        </Html>
    );
}

export default function Logo3D({ reduceMotion }) {
    return (
        <Canvas
            shadows={false}
            dpr={[1, 1.2]}
            camera={{ position: [0, 0, 7.4], fov: 31, near: 0.1, far: 50 }}
            gl={{
                alpha: true,
                antialias: false,
                powerPreference: "low-power",
                preserveDrawingBuffer: false,
            }}
            className="relative z-10 cursor-grab active:cursor-grabbing"
        >
            <ambientLight intensity={1.5} color="#ffffff" />
            <directionalLight
                position={[5, 8, 5]}
                intensity={2.5}
                color="#fff2d0"
            />
            <directionalLight
                position={[-5, -2, -5]}
                intensity={1}
                color="#ff324f"
            />
            <pointLight
                position={[0, 2, 4]}
                intensity={3}
                color="#ffc847"
                distance={10}
            />

            <Suspense fallback={<ModelLoader />}>
                <PresentationControls
                    global
                    cursor
                    snap
                    speed={1}
                    rotation={[0.02, 0, 0]}
                    polar={[-0.1, 0.15]}
                    azimuth={[-0.3, 0.3]}
                    config={{ mass: 1, tension: 150, friction: 20 }}
                >
                    <Float
                        speed={reduceMotion ? 0 : 1}
                        rotationIntensity={reduceMotion ? 0 : 0.05}
                        floatIntensity={reduceMotion ? 0 : 0.15}
                    >
                        <LogoModel reduceMotion={reduceMotion} />
                    </Float>
                </PresentationControls>
            </Suspense>
        </Canvas>
    );
}
