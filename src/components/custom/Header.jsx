import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';

function Header() {
  const navigate = useNavigate();
  const logoRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.from(logoRef.current, {
      opacity: 0,
      x: -100,
      duration: 1,
      ease: 'power3.out',
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-2xl shadow-lg py-3'
          : 'bg-black/60 backdrop-blur-xl py-4'
      }`}
    >
      <div className="px-6 md:px-10 flex justify-between items-center">
        {/* Logo */}
        <div
          ref={logoRef}
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <Sparkles className="w-7 h-7 text-purple-400 transition-all duration-300 group-hover:text-pink-400 group-hover:rotate-180" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Travel Buddy
          </span>
        </div>

        {/* Menu */}
        <div className="flex gap-3 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-purple-400 rounded-full font-medium text-sm transition-all">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Button
              onClick={() => navigate('/my-trips')}
              variant="ghost"
              className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full font-medium text-sm transition-all"
            >
              My Trips
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Header;
