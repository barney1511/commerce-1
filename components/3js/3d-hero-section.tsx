"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import {
  Environment,
  PerspectiveCamera,
  Plane,
  Html,
  OrbitControls,
  MeshReflectorMaterial,
  Image,
  Instances,
  Instance,
} from "@react-three/drei";
import { motion } from "motion/react";
import * as THREE from "three";
import { BenchModel } from "@/components/models/Bench";
import { PictureFrameModel } from "@/components/models/PictureFrame";
import { geometry } from "maath";
import type { Product } from "@/lib/shopify/types";
import { RecordTableModel } from "@/components/models/Record_table";
import { Vector3, Euler } from "three";
import {
  SquareShelfModel,
  SquareShelfInstances,
} from "@/components/models/Square_shelf";
import Link from "next/link";

// Floor constants
const FLOOR_POSITION = new Vector3(0, -2, 0);
const FLOOR_ROTATION = new Euler(-Math.PI / 2, 0, 0);

// Wall positions and rotations
const WALL_POSITIONS = {
  BACK: new Vector3(0, 3, -8),
  LEFT: new Vector3(-15, 3, 0),
  RIGHT: new Vector3(15, 3, 0),
  CEILING: new Vector3(0, 10, 0),
};

const WALL_ROTATIONS = {
  LEFT: new Euler(0, Math.PI / 2, 0),
  RIGHT: new Euler(0, -Math.PI / 2, 0),
  CEILING: new Euler(Math.PI / 2, 0, 0),
};

// Light position constants
const LIGHT_POSITIONS = {
  CENTER: new Vector3(0, 8, -3),
  LEFT: new Vector3(-4, 8, -3),
  RIGHT: new Vector3(4, 8, -3),
  ACCENT: new Vector3(0, 5, 3),
};

// Camera constants
const CAMERA_POSITION = new Vector3(0, 1, 6);
const CAMERA_FOV = 60;

// Painting position data
const PAINTING_POSITIONS: Vector3[] = [
  new Vector3(0, 2, -7), // Center
  new Vector3(-4, 2, -7), // Left
  new Vector3(4, 2, -7), // Right
  new Vector3(-8, 2, -4), // Far left
  new Vector3(8, 2, -4), // Far right
];

const PAINTING_ROTATIONS: Euler[] = [
  new Euler(0, 0, 0), // Center
  new Euler(0, 0, 0), // Left
  new Euler(0, 0, 0), // Right
  new Euler(0, Math.PI / 6, 0), // Far left (angled)
  new Euler(0, -Math.PI / 6, 0), // Far right (angled)
];

// Bench positions
const BENCH_POSITIONS: Vector3[] = [
  new Vector3(0, 0, 2), // Center
  // new Vector3(-6, 0, 1), // Left
  // new Vector3(6, 0, 1), // Right
];

const RECORD_TABLE_POSITION = new Vector3(2, -2, 1);
const RECORD_TABLE_ROTATION = new Euler(0, 0, 0);

const SQUARE_SHELF_POSITION = new Vector3(0, -0.6, -7);
const SQUARE_SHELF_ROTATION = new Euler(0, 0, 0);

interface GalleryHeroProps {
  onProductClick?: (product: Product) => void;
  homepageItems: Product[];
}

// Reflective floor component
function ReflectiveFloor() {
  return (
    <Plane args={[50, 50]} rotation={FLOOR_ROTATION} position={FLOOR_POSITION}>
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={80}
        roughness={1}
        depthScale={1}
        minDepthThreshold={0.2}
        maxDepthThreshold={1.5}
        color="#050505"
        metalness={0.5}
      />
    </Plane>
  );
}

// Gallery walls
function GalleryWalls() {
  const wallMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.9} />;
  const ceilingMaterial = (
    <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
  );

  return (
    <group>
      {/* Back wall */}
      <Plane args={[30, 15]} position={WALL_POSITIONS.BACK}>
        {wallMaterial}
      </Plane>

      {/* Left wall */}
      <Plane
        args={[16, 15]}
        position={WALL_POSITIONS.LEFT}
        rotation={WALL_ROTATIONS.LEFT}
      >
        {wallMaterial}
      </Plane>

      {/* Right wall */}
      <Plane
        args={[16, 15]}
        position={WALL_POSITIONS.RIGHT}
        rotation={WALL_ROTATIONS.RIGHT}
      >
        {wallMaterial}
      </Plane>

      {/* Ceiling */}
      <Plane
        args={[30, 16]}
        position={WALL_POSITIONS.CEILING}
        rotation={WALL_ROTATIONS.CEILING}
      >
        {ceilingMaterial}
      </Plane>
    </group>
  );
}

// Gallery bench
function Bench({ position }: { position: Vector3 }) {
  return (
    <group position={position}>
      <BenchModel position={new Vector3(0, -2, 0)} scale={2} />
    </group>
  );
}

// Lighting setup
function GalleryLighting() {
  // Common spotlight properties
  const spotLightProps = {
    angle: 0.3,
    penumbra: 0.5,
    castShadow: true,
  };

  return (
    <>
      <ambientLight intensity={0.2} />

      {/* Main gallery lights */}
      <spotLight
        position={LIGHT_POSITIONS.CENTER}
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        {...spotLightProps}
      />
      <spotLight
        position={LIGHT_POSITIONS.LEFT}
        intensity={0.8}
        {...spotLightProps}
      />
      <spotLight
        position={LIGHT_POSITIONS.RIGHT}
        intensity={0.8}
        {...spotLightProps}
      />

      {/* Accent lighting */}
      <pointLight
        position={LIGHT_POSITIONS.ACCENT}
        intensity={0.3}
        color="#ffffff"
      />
    </>
  );
}

// Main gallery scene
function GalleryScene({ homepageItems }: GalleryHeroProps) {
  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) return null;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={CAMERA_POSITION}
        fov={CAMERA_FOV}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3}
        maxAzimuthAngle={Math.PI / 6}
        minAzimuthAngle={-Math.PI / 6}
      />

      <GalleryLighting />
      <GalleryWalls />
      <ReflectiveFloor />

      {/* Use instanced shelves for better performance - lined up against the back wall */}
      <SquareShelfInstances count={9} />

      {/* Benches */}
      {BENCH_POSITIONS.map((position, index) => (
        <Bench key={index} position={position} />
      ))}

      <RecordTableModel
        position={RECORD_TABLE_POSITION}
        rotation={RECORD_TABLE_ROTATION}
        scale={2}
      />

      <Environment preset="warehouse" />
    </>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    </Html>
  );
}

// Main component
export default function GalleryHero({
  onProductClick,
  homepageItems,
}: GalleryHeroProps) {
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (!mainContentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Dispatch a custom resize event to trigger Three.js canvas resize
      window.dispatchEvent(new Event("resize"));
    });

    resizeObserver.observe(mainContentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.section
      className="relative w-full h-[calc(100svh-76px)] bg-black overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center translate-y-32 md:translate-y-48 px-4 lg:px-0 text-center pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-white"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">MEMORY</h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-md">
            Curated collection of memories transformed into art
          </p>
          <motion.button
            className="pointer-events-auto bg-white text-black px-8 py-3 font-semibold hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={"/search"} prefetch={true}>Explore Collection</Link>
          </motion.button>
        </motion.div>
      </div>

      {/* 3D Gallery */}
      <Canvas ref={mainContentRef} shadows frameloop="demand">
        <Suspense fallback={<LoadingFallback />}>
          <GalleryScene
            onProductClick={onProductClick}
            homepageItems={homepageItems}
          />
        </Suspense>
      </Canvas>

      {/* Bottom navigation hint */}
      <motion.div
        className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.7 }}
        transition={{ delay: 2, duration: 1 }}
      >
        Drag to explore
      </motion.div>
    </motion.section>
  );
}
