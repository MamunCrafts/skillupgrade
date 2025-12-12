'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-2xl font-bold gradient-text">SkillUpgrade</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  ⚙️ Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-600 text-sm hidden sm:block">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="btn-glow px-6 py-2.5 rounded-lg text-white font-medium"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
