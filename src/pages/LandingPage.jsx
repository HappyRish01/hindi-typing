import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// Particle system for background with colorful particles
const ParticleField = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    
    // Vibrant color palette for particles
    const colors = [
      { r: 168, g: 85, b: 247 },   // purple
      { r: 236, g: 72, b: 153 },   // pink
      { r: 6, g: 182, b: 212 },    // cyan
      { r: 251, g: 191, b: 36 },   // amber
      { r: 34, g: 197, b: 94 },    // green
      { r: 244, g: 63, b: 94 },    // rose
      { r: 99, g: 102, b: 241 },   // indigo
    ];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Create particles with random colors
    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.6 + 0.3,
        color,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

// Floating Hindi characters with glow
const FloatingChar = ({ char, style }) => (
  <div
    className="absolute text-3xl md:text-4xl font-bold pointer-events-none select-none floating-char"
    style={style}
  >
    {char}
  </div>
);

// Animated keyboard key
const KeyCap = ({ char, delay }) => (
  <div 
    className="key-cap"
    style={{ animationDelay: `${delay}s` }}
  >
    <span className="text-lg font-bold">{char}</span>
  </div>
);

// Stats card component
const StatCard = ({ icon, value, label }) => (
  <div className="stat-card">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

// Feature card
const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hindiChars = ['अ', 'आ', 'इ', 'ई', 'उ', 'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज'];
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingCharsData = hindiChars.map((char, i) => ({
    char,
    style: {
      left: `${10 + (i % 4) * 25}%`,
      top: `${15 + Math.floor(i / 4) * 30}%`,
      animationDelay: `${i * 0.5}s`,
      color: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4],
      textShadow: `0 0 20px ${['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4]}40`,
    }
  }));

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden">
        <ParticleField />
        
        {/* Vibrant animated gradient orbs */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-gradient-to-br from-violet-600/60 via-fuchsia-500/50 to-pink-500/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-400/60 via-sky-500/50 to-blue-600/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/50 via-orange-500/45 to-rose-500/40 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-400/50 via-teal-500/45 to-cyan-500/40 rounded-full blur-3xl animate-blob animation-delay-3000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/30 via-pink-500/25 to-rose-500/30 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Extra color pops */}
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-yellow-400/40 to-amber-600/30 rounded-full blur-2xl animate-blob animation-delay-1000" />
        <div className="absolute bottom-40 left-20 w-[250px] h-[250px] bg-gradient-to-tr from-lime-400/35 to-emerald-500/30 rounded-full blur-2xl animate-blob animation-delay-5000" />
        
        {/* Interactive gradient mesh */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.35) 0%, transparent 35%),
              radial-gradient(ellipse at 15% 85%, rgba(6, 182, 212, 0.3) 0%, transparent 45%),
              radial-gradient(ellipse at 85% 15%, rgba(244, 63, 94, 0.3) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(34, 197, 94, 0.2) 0%, transparent 40%)
            `,
          }}
        />
        
        {/* Floating Hindi characters */}
        {floatingCharsData.map((data, i) => (
          <FloatingChar key={i} char={data.char} style={data.style} />
        ))}
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-8 pb-16">
          {/* Main Title */}
          <h1 className="text-center mb-6 animate-fade-in-up">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-black text-white mb-2 tracking-tight">
              Master
            </span>
            <span className="block text-6xl md:text-8xl lg:text-9xl font-black hindi-gradient">
              मंगल
            </span>
            <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-gray-300 mt-2">
              Typing
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 text-center max-w-xl mb-10 animate-fade-in-up animation-delay-200">
            An arcade-style game that makes learning Hindi typing fun and addictive
          </p>

          {/* Animated keyboard preview */}
          <div className="keyboard-preview mb-10 animate-fade-in-up animation-delay-300">
            {['अ', 'आ', 'इ', 'ई', 'उ'].map((char, i) => (
              <KeyCap key={char} char={char} delay={i * 0.15} />
            ))}
          </div>

          {/* CTA Button */}
          <Link 
            to="/game"
            className="play-button group animate-fade-in-up animation-delay-400"
          >
            <div className="play-button-bg"></div>
            <div className="play-button-content">
              <svg className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span className="text-xl md:text-2xl font-bold">Start Game</span>
            </div>
          </Link>
          
          <p className="text-gray-500 text-sm mt-4 animate-fade-in animation-delay-500">
            Press Enter or Click to Play
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why Play <span className="text-cyan-400">Daisy</span>?
            </h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              The most engaging way to improve your Hindi Mangal typing skills
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon="🎯"
                title="Progressive Difficulty"
                description="4 rounds with 3 difficulty levels each. Start easy, become a pro!"
              />
              <FeatureCard 
                icon="⚡"
                title="Real-time Stats"
                description="Track your WPM, accuracy, and score as you play"
              />
              <FeatureCard 
                icon="🏆"
                title="Vocabulary Building"
                description="Learn 500+ Hindi words while having fun"
              />
            </div>
          </div>
        </section>

        {/* Stats Preview */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="stats-container">
              <StatCard icon="📝" value="500+" label="Words" />
              <StatCard icon="🎮" value="4" label="Rounds" />
              <StatCard icon="⭐" value="12" label="Levels" />
              <StatCard icon="🔥" value="∞" label="Fun" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-gray-800/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Built for Hindi typing enthusiasts
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Made with</span>
              <span className="text-red-500">❤️</span>
              <span className="text-sm">for</span>
              <span className="text-cyan-400 font-bold">हिंदी</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Styles */}
      <style>{`
        /* Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(139, 92, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(139, 92, 246, 0.3);
          }
        }
        
        @keyframes key-press {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        
        @keyframes blob {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
          }
          25% { 
            transform: translate(20px, -30px) scale(1.05);
          }
          50% { 
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% { 
            transform: translate(30px, 10px) scale(1.02);
          }
        }
        
        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
        
        .floating-char {
          animation: float 6s ease-in-out infinite;
          opacity: 0.15;
          font-size: 4rem;
        }
        
        /* Hindi gradient text */
        .hindi-gradient {
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.4));
        }
        
        /* Badge */
        .badge-glow {
          position: relative;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 50px;
          font-size: 14px;
          color: #a78bfa;
          backdrop-filter: blur(10px);
        }
        
        .badge-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        /* Keyboard preview */
        .keyboard-preview {
          display: flex;
          gap: 8px;
        }
        
        .key-cap {
          width: 50px;
          height: 50px;
          background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e2e8f0;
          box-shadow: 
            0 4px 0 #0f0f1a,
            0 6px 10px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: key-press 1.5s ease-in-out infinite;
        }
        
        .key-cap:hover {
          background: linear-gradient(180deg, #3a3a4e 0%, #2a2a3e 100%);
          transform: translateY(2px);
          box-shadow: 
            0 2px 0 #0f0f1a,
            0 4px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* Play button */
        .play-button {
          position: relative;
          padding: 16px 48px;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          text-decoration: none;
        }
        
        .play-button-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%);
          border-radius: 16px;
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .play-button-bg::before {
          content: '';
          position: absolute;
          inset: 2px;
          background: #0a0a12;
          border-radius: 14px;
        }
        
        .play-button-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          z-index: 1;
        }
        
        .play-button:hover .play-button-bg {
          animation: none;
          box-shadow: 0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(139, 92, 246, 0.3);
        }
        
        .play-button:hover .play-button-bg::before {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        }
        
        /* Feature cards */
        .feature-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-4px);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 16px;
        }
        
        /* Stats */
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        @media (max-width: 640px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: scale(1.05);
          border-color: rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}
