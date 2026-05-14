/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Gallery3D from './components/Gallery3D';
import { ViewerUI } from './components/ViewerUI';
import { Artwork } from './data/artworks';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#0A0A0A] select-none uppercase tracking-widest">
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            key="preloader"
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <div className="flex items-center gap-6 mb-8 justify-center">
                <div className="h-px w-16 bg-gold" />
                <h1 className="text-2xl font-serif tracking-[0.5em] text-white">KEITH GALLERY</h1>
                <div className="h-px w-16 bg-gold" />
              </div>
              <div className="w-64 h-[2px] bg-white/5 overflow-hidden mx-auto">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-gold"
                />
              </div>
              <p className="mt-12 text-[9px] font-mono text-white/30 tracking-[0.6em] uppercase">Initialising Core Environment</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full h-full">
        <Gallery3D 
          onArtworkSelect={setSelectedArtwork} 
          selectedArtwork={selectedArtwork}
        />
      </div>

      <ViewerUI 
        artwork={selectedArtwork} 
        onClose={() => setSelectedArtwork(null)} 
      />

      {/* Decorative borders for premium feel */}
      <div className="absolute top-0 inset-x-0 h-[10px] bg-black z-20" />
      <div className="absolute bottom-0 inset-x-0 h-[10px] bg-black z-20" />
      <div className="absolute left-0 inset-y-0 w-[10px] bg-black z-20" />
      <div className="absolute right-0 inset-y-0 w-[10px] bg-black z-20" />
      
      {/* Corner gold accents */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-gold/40 z-30" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-gold/40 z-30" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-gold/40 z-30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-gold/40 z-30" />
    </div>
  );
}

