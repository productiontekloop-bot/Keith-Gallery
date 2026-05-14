import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, User, Info, ArrowLeft } from 'lucide-react';
import { Artwork } from '../data/artworks';

interface ViewerUIProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export function ViewerUI({ artwork, onClose }: ViewerUIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {artwork && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#121212]/95 backdrop-blur-2xl shadow-2xl p-10 flex flex-col pointer-events-auto border-l border-white/10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <div className="flex-1">
              <motion.span 
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                className="text-[10px] font-bold text-gold uppercase mb-6 block"
              >
                Selected Exhibit
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-serif text-white mb-2 leading-tight"
              >
                {artwork.title}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/50 text-sm italic mb-8"
              >
                {artwork.artist}, 2024
              </motion.p>

              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-white/70 text-sm leading-relaxed font-light">
                    {artwork.description}
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-6 border-t border-white/10 flex justify-between items-baseline"
                >
                  <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Acquisition Value</span>
                  <span className="text-white font-serif text-3xl">{artwork.price || 'P.O.A'}</span>
                </motion.div>
              </div>

              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => window.open(artwork.productUrl, '_blank')}
                className="w-full bg-gold text-black py-5 mt-10 font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
              >
                Buy Product
              </motion.button>

              <div className="mt-12 flex gap-4 opacity-20 grayscale">
                <div className="w-12 h-12 bg-white/10 rounded-sm" />
                <div className="w-12 h-12 bg-white/10 rounded-sm" />
                <div className="w-12 h-12 bg-white/10 rounded-sm" />
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">
                Pavilion Records &copy; MMXXVI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-10 left-10 flex items-center gap-6">
        <div className="h-px w-12 bg-gold" />
        <div className="text-white/80 text-xs tracking-[0.5em] uppercase font-light font-sans">Modernist Pavilion</div>
      </div>

      <div className="absolute bottom-10 right-14 flex flex-col items-end pointer-events-none">
        <div className="text-white/10 text-[80px] font-serif italic leading-none">01</div>
        <div className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Main Hall</div>
      </div>

      <AnimatePresence>
        {!artwork && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-4">
              <div className="flex gap-1.5">
                {['W', 'A', 'S', 'D'].map(key => (
                  <span key={key} className="px-2 py-0.5 border border-white/20 rounded text-[10px] text-white/60 font-bold">{key}</span>
                ))}
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Interact with Art</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
