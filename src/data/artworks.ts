import { GALLERY_IMAGES, ImageArtwork } from './images';

export interface Artwork extends ImageArtwork {
  position: [number, number, number];
  rotation: [number, number, number];
}

export const ARTWORKS: Artwork[] = GALLERY_IMAGES.map((img, i) => {
  const wallIndex = Math.floor(i / 5);
  const posInWall = (i % 5) - 2; // -2, -1, 0, 1, 2
  const spacing = 5.5;
  const x = posInWall * spacing;
  const y = 4;
  
  let position: [number, number, number] = [0, y, 0];
  let rotation: [number, number, number] = [0, 0, 0];
  
  if (wallIndex === 0) { // North Wall
    position = [x, y, -14.85];
    rotation = [0, 0, 0];
  } else if (wallIndex === 1) { // South Wall
    position = [x, y, 14.85];
    rotation = [0, Math.PI, 0];
  } else if (wallIndex === 2) { // West Wall
    position = [-14.85, y, x];
    rotation = [0, Math.PI / 2, 0];
  } else if (wallIndex === 3) { // East Wall
    position = [14.85, y, x];
    rotation = [0, -Math.PI / 2, 0];
  }

  return {
    ...img,
    position,
    rotation,
  };
});
