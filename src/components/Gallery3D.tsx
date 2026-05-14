import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, ContactShadows, Environment, Float, PerspectiveCamera, useCursor } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ARTWORKS, Artwork } from '../data/artworks';
import { ArtFrame } from './ArtFrame';
import ErrorBoundary from './ErrorBoundary';

interface Gallery3DProps {
  onArtworkSelect: (artwork: Artwork | null) => void;
  selectedArtwork: Artwork | null;
}

function Rig({ selectedArtwork }: { selectedArtwork: Artwork | null }) {
  const vec = new THREE.Vector3();
  const lookAtVec = new THREE.Vector3();
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
  const pos = useRef(new THREE.Vector3(0, 1.8, 4));
  
  const targetLookAt = useRef(new THREE.Vector3(0, 1.8, -5));
  const rotation = useRef({ yaw: Math.PI, pitch: 0 }); // Start looking towards center
  const isDragging = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        setKeys(k => ({ 
          ...k, 
          w: key === 'w' || key === 'arrowup' ? true : k.w,
          a: key === 'a' || key === 'arrowleft' ? true : k.a,
          s: key === 's' || key === 'arrowdown' ? true : k.s,
          d: key === 'd' || key === 'arrowright' ? true : k.d,
        }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        setKeys(k => ({ 
          ...k, 
          w: key === 'w' || key === 'arrowup' ? false : k.w,
          a: key === 'a' || key === 'arrowleft' ? false : k.a,
          s: key === 's' || key === 'arrowdown' ? false : k.s,
          d: key === 'd' || key === 'arrowright' ? false : k.d,
        }));
      }
    };

    const handleMouseDown = () => {
      isDragging.current = true;
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && !selectedArtwork) {
        const sensitivity = 0.002;
        rotation.current.yaw -= e.movementX * sensitivity;
        rotation.current.pitch -= e.movementY * sensitivity;
        rotation.current.pitch = THREE.MathUtils.clamp(rotation.current.pitch, -Math.PI / 3, Math.PI / 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedArtwork]);

  useFrame((state, delta) => {
    if (selectedArtwork) {
      // Zoom into artwork
      const artRotation = new THREE.Euler(...selectedArtwork.rotation);
      const offset = new THREE.Vector3(0, 0, 1.8);
      offset.applyEuler(artRotation);
      
      const artworkPos = new THREE.Vector3(...selectedArtwork.position);
      const camPos = artworkPos.clone().add(offset);
      
      state.camera.position.lerp(camPos, 0.05);
      
      // Look at painting center
      lookAtVec.set(artworkPos.x, artworkPos.y, artworkPos.z);
      targetLookAt.current.lerp(lookAtVec, 0.08);
      state.camera.lookAt(targetLookAt.current);
      
      // Sync internal rotation when an artwork is selected so we look the right way when deselected
      rotation.current.yaw = selectedArtwork.rotation[1] + Math.PI;
      rotation.current.pitch = 0;
    } else {
      // WASD Movement relative to look direction
      const speed = 6;
      let isMoving = false;
      
      if (keys.w || keys.s || keys.a || keys.d) {
        const yaw = rotation.current.yaw;
        const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
        
        const direction = new THREE.Vector3();
        if (keys.w) direction.add(forward);
        if (keys.s) direction.sub(forward);
        if (keys.a) direction.add(right);
        if (keys.d) direction.sub(right);

        if (direction.length() > 0) {
          direction.normalize().multiplyScalar(speed * delta);
          pos.current.add(direction);
          isMoving = true;
        }
      }
      
      // Boundary checks (for ROOM_SIZE x ROOM_SIZE room)
      const limit = ROOM_SIZE / 2 - 1.5;
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -limit, limit);
      pos.current.z = THREE.MathUtils.clamp(pos.current.z, -limit, limit);
      
      // Head bobbing
      const bobPath = Math.sin(state.clock.elapsedTime * 8) * 0.012 * (isMoving ? 1 : 0);
      
      state.camera.position.lerp(vec.set(
        pos.current.x, 
        pos.current.y + bobPath, 
        pos.current.z
      ), 0.08);
      
      // Dynamic Look-at based on yaw/pitch
      const radius = 8;
      lookAtVec.set(
        pos.current.x + radius * Math.sin(rotation.current.yaw) * Math.cos(rotation.current.pitch),
        pos.current.y + radius * Math.sin(rotation.current.pitch),
        pos.current.z + radius * Math.cos(rotation.current.yaw) * Math.cos(rotation.current.pitch)
      );

      targetLookAt.current.lerp(lookAtVec, 0.15);
      state.camera.lookAt(targetLookAt.current);
    }
  });
  return null;
}

const ROOM_SIZE = 30;
const ROOM_HEIGHT = 8;

function Room() {
  const wallProps = {
    color: "#8b0000", 
    roughness: 0.9, 
    metalness: 0.1,
  };

  return (
    <group>
      {/* Floor with Reflections and Wood Finish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE + 20, ROOM_SIZE + 20]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_SIZE + 20, ROOM_SIZE + 20]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>

      {/* Walls */}
      <group>
        {/* North */}
        <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_SIZE / 2]} receiveShadow>
          <boxGeometry args={[ROOM_SIZE, ROOM_HEIGHT, 0.2]} />
          <meshStandardMaterial {...wallProps} />
        </mesh>
        {/* South */}
        <mesh position={[0, ROOM_HEIGHT / 2, ROOM_SIZE / 2]} receiveShadow>
          <boxGeometry args={[ROOM_SIZE, ROOM_HEIGHT, 0.2]} />
          <meshStandardMaterial {...wallProps} />
        </mesh>
        {/* West */}
        <mesh position={[-ROOM_SIZE / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[ROOM_SIZE, ROOM_HEIGHT, 0.2]} />
          <meshStandardMaterial {...wallProps} />
        </mesh>
        {/* East */}
        <mesh position={[ROOM_SIZE / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <boxGeometry args={[ROOM_SIZE, ROOM_HEIGHT, 0.2]} />
          <meshStandardMaterial {...wallProps} />
        </mesh>
      </group>

      {/* Bench (Central Piece) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[2, 0.5, 0.8]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>

      {/* Lights */}
      <group>
        <ambientLight intensity={0.1} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={0.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[0, ROOM_HEIGHT - 2, 0]} intensity={0.5} distance={30} />
      </group>
    </group>
  );
}

export default function Gallery3D({ onArtworkSelect, selectedArtwork }: Gallery3DProps) {
  const artworksWithPositions = useMemo(() => {
    const imagesPerWall = 5;
    const spacingX = 5.5;
    const centerY = 4;
    const offset = ROOM_SIZE / 2 - 0.15;

    return ARTWORKS.map((artwork, index) => {
      const wallIndex = Math.floor(index / imagesPerWall);
      const posIndex = index % imagesPerWall;
      const wallPos = (posIndex - (imagesPerWall - 1) / 2) * spacingX;

      let position: [number, number, number] = [0, centerY, -offset];
      let rotation: [number, number, number] = [0, 0, 0];

      switch (wallIndex) {
        case 0: // North
          position = [wallPos, centerY, -offset];
          rotation = [0, 0, 0];
          break;
        case 1: // South
          position = [wallPos, centerY, offset];
          rotation = [0, Math.PI, 0];
          break;
        case 2: // West
          position = [-offset, centerY, -wallPos];
          rotation = [0, Math.PI / 2, 0];
          break;
        case 3: // East
          position = [offset, centerY, wallPos];
          rotation = [0, -Math.PI / 2, 0];
          break;
      }

      return {
        ...artwork,
        position,
        rotation
      };
    });
  }, []);

  return (
    <div className="w-full h-full bg-[#0A0A0A]">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.8, 10], fov: 60 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0A0A0A']} />
        <fog attach="fog" args={['#0A0A0A', 5, 35]} />
        
        <Suspense fallback={null}>
          <Environment preset="apartment" blur={0.8} />
          
          <Room />
          
          {artworksWithPositions.map((artwork) => (
            <ArtFrame 
              key={artwork.id} 
              artwork={artwork} 
              onClick={onArtworkSelect}
              isActive={selectedArtwork?.id === artwork.id}
            />
          ))}
          
          <Rig selectedArtwork={selectedArtwork} />
        </Suspense>
      </Canvas>
    </div>
  );
}

