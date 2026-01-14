import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Animated Hindi word display
const FloatingWord = ({ word, delay, duration }) => {
  const [position] = useState({
    left: Math.random() * 80 + 10,
    animationDelay: delay,
    animationDuration: duration,
  });

  return (
    <div
      className="absolute text-purple-400/20 text-xl font-bold pointer-events-none animate-float"
      style={{
        left: `${position.left}%`,
        animationDelay: `${position.animationDelay}s`,
        animationDuration: `${position.animationDuration}s`,
      }}
    >
      {word}
    </div>
  );
};

// Animated typing effect
const TypeWriter = ({ texts, speed = 100 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed]);

  return (
    <span className="text-cyan-400">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function LandingPage() {
  const floatingWords = ['हिंदी', 'टाइपिंग', 'मंगल', 'अभ्यास', 'गति', 'शुद्धता', 'शब्द', 'भाषा'];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {floatingWords.map((word, i) => (
          <FloatingWord 
            key={i} 
            word={word} 
            delay={i * 2} 
            duration={15 + Math.random() * 10} 
          />
        ))}
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #4a4063 1px, transparent 1px),
              linear-gradient(to bottom, #4a4063 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center pt-12">
        <div className="mb-6">
          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300">
            🎮 Master Mangal Typing with Fun
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Type </span>
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            हिंदी
          </span>
          <br />
          <span className="text-white">Like a </span>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Pro
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl">
          An arcade-style typing game to boost your
        </p>
        
        <div className="text-2xl md:text-3xl font-bold mb-8 h-12">
          <TypeWriter 
            texts={['Mangal Typing Speed', 'Hindi Vocabulary', 'Typing Accuracy', 'Keyboard Skills']} 
            speed={80}
          />
        </div>

        {/* Prominent Play Now Button */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <Link 
            to="/game"
            className="group px-20 py-10 md:px-32 md:py-14 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-600 rounded-3xl font-black text-4xl md:text-6xl hover:shadow-2xl hover:shadow-cyan-500/60 transition-all transform hover:scale-110 flex items-center gap-6 animate-pulse hover:animate-none border-4 border-white/20"
          >
            <span className="text-5xl md:text-7xl">🎮</span>
            <span>PLAY NOW</span>
            <span className="group-hover:translate-x-3 transition-transform text-5xl md:text-7xl">🚀</span>
          </Link>
          <p className="text-gray-300 text-xl md:text-2xl">Click to start the game!</p>
        </div>
      </section>

      {/* Custom CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
