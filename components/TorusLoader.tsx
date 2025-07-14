
import React, { useEffect, useRef } from 'react';

interface TorusLoaderProps {
  showIntroText?: boolean;
}

const TorusLoader: React.FC<TorusLoaderProps> = ({ showIntroText = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    class Particle {
      u: number; v: number; R: number; r: number; size: number; opacity: number; speed: number; grayValue: number; phase: number; x: number = 0; y: number = 0; displaySize: number = 0; displayOpacity: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.u = Math.random() * Math.PI * 2;
        this.v = Math.random() * Math.PI * 2;
        this.R = Math.min(canvas.width, canvas.height) * 0.27; // Major radius based on canvas size
        this.r = this.R * 0.4 + Math.random() * (this.R * 0.2); // Minor radius variation
        
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.speed = Math.random() * 0.001875 + 0.0005;
        
        this.grayValue = Math.random() * 160 + 60; // Range from dark to light gray
        
        this.phase = Math.random() * Math.PI * 2;
      }

      update(time: number) {
        this.u += this.speed;
        
        const breathingFactor = Math.sin(time + this.phase) * (this.R * 0.0003); 
        this.r += breathingFactor;
        
        const x_3d = (this.R + this.r * Math.cos(this.v)) * Math.cos(this.u);
        const y_3d = (this.R + this.r * Math.cos(this.v)) * Math.sin(this.u);
        const z_3d = this.r * Math.sin(this.v);
        
        const scale = 1000 / (1000 + z_3d);
        this.x = x_3d * scale + canvas.width / 2;
        this.y = y_3d * scale + canvas.height / 2;
        
        this.displaySize = this.size * scale;
        this.displayOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.u));
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(${this.grayValue}, ${this.grayValue}, ${this.grayValue}, ${this.displayOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.displaySize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const numParticles = 9000;
    let time = 0;

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    let lastFrameTime = 0;
    const targetFPS = 20;
    const frameInterval = 1000 / targetFPS;
    let animationFrameId: number | null = null;
    
    function animate(currentTime: number) {
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTime;
      
      if (deltaTime >= frameInterval) {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        time += 0.004;
        
        particles.forEach(particle => {
          particle.update(time);
          particle.draw();
        });
        
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ width: '550px', height: '550px' }}>
      {showIntroText && (
        <>
          <style>
            {`
              @keyframes fadeInWord {
                0%, 50% { opacity: 0; transform: translate(-50%, -40%); }
                100% { opacity: 1; transform: translate(-50%, -50%); }
              }

              .hawas-word {
                color: white;
                font-size: 2.5rem;
                font-family: 'Noto Sans Arabic', sans-serif;
                animation: fadeInWord 3s ease-out forwards;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10;
                text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
              }
            `}
          </style>
          <h1 className="hawas-word">هَوَسْ</h1>
        </>
      )}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default TorusLoader;
