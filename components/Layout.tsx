import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    const leftEye = cursor?.querySelector('circle:nth-of-type(1)');
    const rightEye = cursor?.querySelector('circle:nth-of-type(2)');

    const handleMouseMove = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }

      const moveX = (e.clientX / window.innerWidth - 0.5) * 15;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 15;

      if (leftEye) {
        leftEye.setAttribute('cx', `${25 + moveX}`);
        leftEye.setAttribute('cy', `${30 + moveY}`);
      }

      if (rightEye) {
        rightEye.setAttribute('cx', `${50 + moveX}`);
        rightEye.setAttribute('cy', `${30 + moveY}`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [location]);

  const isHomePage = location.pathname === '/';
  const isProjectPage = location.pathname.startsWith('/work/') || location.pathname.startsWith('/project/');
  const bgColor = isScrolled
    ? 'bg-white shadow-xl border-b-4 border-[#2D2D2D]'
    : 'bg-transparent border-b-4 border-transparent';

  const navItems = [
    { path: '/work', label: 'WORK' },
    { path: '/gallery', label: 'GALLERY' },
    { path: '/about', label: 'ABOUT' },
  ];
  const logoTone = isProjectPage && !isScrolled
    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]'
    : 'text-[#1f1f1f]';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-gray-200 selection:text-gray-900 bg-white">
      {/* Custom cursor for non-homepage pages */}
      {location.pathname !== '/' && (
        <div id="custom-cursor" style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999, transform: 'translate(-50%, -50%)' }}>
          <svg width="70" height="60" viewBox="0 0 70 40">
            <ellipse cx="25" cy="30" rx="10" ry="15" fill="white" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="25" cy="30" r="6" fill="#1a1a1a" />
            <ellipse cx="50" cy="30" rx="10" ry="15" fill="white" stroke="#1a1a1a" strokeWidth="2" />
            <circle cx="50" cy="30" r="6" fill="#1a1a1a" />
          </svg>
        </div>
      )}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] px-6 md:px-10 py-4 flex justify-between items-center pointer-events-auto transition-[background-color,box-shadow,border-color] duration-300 ${bgColor}`} style={{ cursor: 'auto' }}>
        <div className="pointer-events-auto">
          <NavLink
            to="/"
            className={`text-3xl font-black tracking-tight hover:scale-110 transition-transform relative z-[1001] ${logoTone}`}
            onClick={() => setIsMenuOpen(false)}
          >
            JIALU
          </NavLink>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex pointer-events-auto items-center gap-3">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  px-4 py-2 rounded-full border-2 border-[#2D2D2D] bg-white/90 text-sm font-semibold tracking-wide shadow-[0_3px_10px_rgba(0,0,0,0.24)]
                  transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)] ${idx % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1'}
                  ${isActive ? 'bg-[#FF6B6B] text-[#1f1f1f] border-[#2D2D2D]' : 'text-[#1f1f1f]'}
                `}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/jialu-sun-creative-strategist/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#2D2D2D] bg-[#FFD93D] text-[#1f1f1f] shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)] hover:-rotate-1"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1f1f1f]" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.08 1 2.48 1c1.42 0 2.5 1.12 2.5 2.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.8v2.12h.06c.53-1 1.82-2.12 3.74-2.12 4 0 4.74 2.63 4.74 6.05v9.47h-4v-8.4c0-2-.04-4.58-2.8-4.58-2.8 0-3.23 2.18-3.23 4.44v8.54h-4V7.98z"/>
                </svg>
              </a>
              <a
                href="mailto:jialusun.sun@gmail.com"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#2D2D2D] bg-[#FF9ECD] text-[#1f1f1f] shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)] hover:rotate-1"
                aria-label="Email"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1f1f1f]" aria-hidden="true">
                  <path d="M2 5.5C2 4.67 2.67 4 3.5 4h17c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5h-17C2.67 20 2 19.33 2 18.5v-13zm2.2.5 7.8 5.2 7.8-5.2H4.2zm16.3 1.8-8.1 5.4c-.34.23-.79.23-1.13 0L3.2 7.8V18.5h16.8V7.8z"/>
                </svg>
              </a>
            </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden pointer-events-auto relative z-[1001]">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full ${isScrolled || !isHomePage ? 'bg-gray-200 text-black' : 'bg-gray-800 text-white'}`}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center gap-6 transition-transform duration-500 md:hidden border-b-4 border-[#2D2D2D] ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
         {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-3xl font-bold text-gray-900 px-6 py-3 rounded-full border-2 border-[#2D2D2D] shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
            >
              {item.label}
            </NavLink>
          ))}
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/jialu-sun-creative-strategist/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#2D2D2D] bg-[#FFD93D] text-[#1f1f1f] shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)] hover:-rotate-1"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1f1f1f]" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.08 1 2.48 1c1.42 0 2.5 1.12 2.5 2.5zM.5 23.5h4V7.98h-4V23.5zM8.5 7.98h3.8v2.12h.06c.53-1 1.82-2.12 3.74-2.12 4 0 4.74 2.63 4.74 6.05v9.47h-4v-8.4c0-2-.04-4.58-2.8-4.58-2.8 0-3.23 2.18-3.23 4.44v8.54h-4V7.98z"/>
              </svg>
            </a>
            <a
              href="mailto:jialusun.sun@gmail.com"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#2D2D2D] bg-[#FF9ECD] text-[#1f1f1f] shadow-[0_3px_10px_rgba(0,0,0,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.28)] hover:rotate-1"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1f1f1f]" aria-hidden="true">
                <path d="M2 5.5C2 4.67 2.67 4 3.5 4h17c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5h-17C2.67 20 2 19.33 2 18.5v-13zm2.2.5 7.8 5.2 7.8-5.2H4.2zm16.3 1.8-8.1 5.4c-.34.23-.79.23-1.13 0L3.2 7.8V18.5h16.8V7.8z"/>
              </svg>
            </a>
          </div>
      </div>

      <main className="flex-grow w-full">
        {children}
      </main>

      {!location.pathname.includes('/gallery') && (
        <footer className="bg-gray-50 text-gray-500 py-8 px-6 text-center text-xs md:text-sm font-mono border-t border-gray-200 relative z-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
             <span>&copy; {new Date().getFullYear()} JIALU</span>
             <span className="hidden md:inline">•</span>
             <span>Bridging digital play with real human curiosity.</span>
          </div>
        </footer>
      )}
    </div>
  );
};
