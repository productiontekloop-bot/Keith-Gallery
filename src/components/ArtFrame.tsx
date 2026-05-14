import { useTexture, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { Artwork } from '../data/artworks';
import ErrorBoundary from './ErrorBoundary';

interface ArtFrameProps {
  artwork: Artwork;
  onClick: (artwork: Artwork) => void;
  isActive: boolean;
}

function TextureMesh({ imageUrl, hovered, isActive, onAspectRetrieved }: { imageUrl: string, hovered: boolean, isActive: boolean, onAspectRetrieved: (aspect: number) => void }) {
  const texture = useTexture(imageUrl);
  
  useEffect(() => {
    const img = texture.image as any;
    if (img && img.width && img.height) {
      onAspectRetrieved(img.width / img.height);
    }
  }, [texture, onAspectRetrieved]);

  return (
    <meshStandardMaterial 
      map={texture} 
      emissive={hovered || isActive ? "#222" : "#000"}
      emissiveIntensity={0.5}
      toneMapped={false}
      polygonOffset
      polygonOffsetFactor={-1}
    />
  );
}

function FallbackMaterial({ hovered, isActive }: { hovered: boolean, isActive: boolean }) {
  return (
    <meshStandardMaterial 
      color="#1a1a1a"
      roughness={0.8}
      emissive={hovered || isActive ? "#333" : "#000"}
      emissiveIntensity={0.5}
    />
  );
}

export function ArtFrame({ artwork, onClick, isActive }: ArtFrameProps) {
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  // All images are 1080x1080 (square) - making them larger
  const width = 3.5;
  const height = 3.5;

  return (
    <group position={artwork.position} rotation={artwork.rotation}>
      {/* Frame / Border */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.2} 
          metalness={0.5} 
        />
      </mesh>

      {/* Artwork Canvas */}
      <mesh 
        position={[0, 0, 0.01]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(artwork)}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <ErrorBoundary fallback={<FallbackMaterial hovered={hovered} isActive={isActive} />}>
          <Suspense fallback={<meshStandardMaterial color="#050505" />}>
            <TextureMesh 
              imageUrl={artwork.imageUrl} 
              hovered={hovered} 
              isActive={isActive} 
              onAspectRetrieved={() => {}}
            />
          </Suspense>
        </ErrorBoundary>
      </mesh>

      {/* Focused Spotlight for active/hovered artwork */}
      {(isActive || hovered) && (
        <spotLight
          position={[0, 3, 4]}
          target-position={[0, 0, 0]}
          intensity={isActive ? 4 : 2}
          angle={0.4}
          penumbra={1}
          distance={10}
          castShadow={isActive}
          color={isActive ? "#ffffff" : "#fff4e6"}
        />
      )}
    </group>
  );
}
