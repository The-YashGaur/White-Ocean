import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/whiteocean.png';
import './Loader.css';

const Loader = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ultra-fast total loading time: ~1.8 seconds total
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onLoadingComplete, 600); // Wait for smooth exit animation
    }, 1200);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="premium-loader-overlay"
          initial={{ opacity: 1, backdropFilter: 'blur(10px)' }}
          exit={{ 
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } // Smooth Apple-style ease
          }}
        >
          <motion.div 
            className="loader-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="loader-logo-wrapper">
              <div className="glow-effect"></div>
              <img src={logo} alt="WhiteOcean Logo" className="loader-logo-img" />
            </div>
            
            <div className="loader-text-wrapper">
              <span className="loader-welcome">Welcome On</span>
              <h1 className="loader-brand">White<span className="text-primary">Ocean</span></h1>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
