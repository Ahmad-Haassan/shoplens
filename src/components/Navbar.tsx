import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';

export function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6F4E37] flex items-center justify-center shadow-sm">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text-main)]">ShopLens<span className="text-[#6F4E37]">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How it works</a>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--card-border)] transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5 text-[var(--primary)]" /> : <Moon className="w-5 h-5 text-[var(--primary)]" />}
          </button>
          {user ? (
            <UserMenu email={user.email} />
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="primary-btn text-sm py-2 px-4">Sign In</button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
