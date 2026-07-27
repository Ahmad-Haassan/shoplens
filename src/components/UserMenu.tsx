import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Bookmark, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UserMenu({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success('Signed out successfully');
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-[var(--card-border)] transition-colors border border-transparent hover:border-[var(--border-light)]"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {email.substring(0, 2).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-color)] border border-[var(--border-light)] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-[var(--border-light)] bg-[var(--card-bg)]">
            <p className="text-sm font-semibold text-[var(--text-main)] truncate">{email}</p>
            <p className="text-xs text-[var(--text-muted)]">Premium Member</p>
          </div>
          
          <div className="p-2 space-y-1">
            <Link
              href="/saved"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--card-border)] rounded-xl transition-colors"
            >
              <Bookmark className="w-4 h-4 text-[#6F4E37]" />
              Saved Deals
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--card-border)] rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-[var(--text-muted)]" />
              Settings
            </Link>
          </div>
          
          <div className="p-2 border-t border-[var(--border-light)]">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
