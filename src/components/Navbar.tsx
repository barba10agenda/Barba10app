import React from 'react';
import { Scissors, User, LogOut, ShieldCheck, CalendarCheck2, Radio, Menu } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount | null;
  activeView: 'home' | 'quiz' | 'admin' | 'my-appointments';
  setActiveView: (view: 'home' | 'quiz' | 'admin' | 'my-appointments') => void;
  openAuthModal: () => void;
  handleLogout: () => void;
  realtimeActive: boolean;
  onOpenAdminSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  openAuthModal,
  handleLogout,
  realtimeActive,
  onOpenAdminSidebar,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-syne text-lg font-bold tracking-tighter text-white uppercase sm:text-xl">
              JADSON <span className="text-yellow-400">BARBER</span>
            </div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              Slim Experience
            </p>
          </div>
        </button>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => setActiveView('home')}
            className={`text-sm uppercase tracking-widest transition-colors ${
              activeView === 'home'
                ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Início
          </button>
          
          <button
            onClick={() => setActiveView('quiz')}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-1.5 border rounded-full transition-all uppercase tracking-wider ${
              activeView === 'quiz'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                : 'text-yellow-500/80 border-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/40'
            }`}
          >
            Agendar
          </button>

          {currentUser && currentUser.role === 'client' && (
            <button
              onClick={() => setActiveView('my-appointments')}
              className={`flex items-center gap-1.5 text-sm uppercase tracking-widest transition-colors ${
                activeView === 'my-appointments'
                  ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarCheck2 className="h-3.5 w-3.5 text-yellow-400" />
              Meus Agendamentos
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                activeView === 'admin'
                  ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                  : 'bg-white/5 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Painel Admin
            </button>
          )}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Live Sync Status */}
          <div className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-gray-400 sm:flex">
            <Radio className={`h-3 w-3 ${realtimeActive ? 'animate-pulse text-yellow-400' : 'text-gray-600'}`} />
            <span>{realtimeActive ? 'Base Live' : 'Online'}</span>
          </div>

          {/* User Logged or Discreet Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col justify-center">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">{currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>

              {currentUser.role === 'admin' && activeView === 'admin' && onOpenAdminSidebar ? (
                <button
                  onClick={onOpenAdminSidebar}
                  title="Abrir Menu do Painel ADM"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                >
                  <Menu className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-xs text-yellow-500/90 hover:text-yellow-400 font-medium px-3 py-1 border border-yellow-500/20 rounded-full transition-all uppercase tracking-wider flex items-center gap-1 hover:border-yellow-500/40"
            >
              <User className="h-3 w-3 text-yellow-400" />
              <span>Entrar</span>
            </button>
          )}

        </div>
      </div>


    </header>
  );
};
