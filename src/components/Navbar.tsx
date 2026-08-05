import React from 'react';
import { Scissors, User, LogOut, ShieldCheck, CalendarCheck2, Radio, Menu } from 'lucide-react';
import { UserAccount } from '../types';
import { ShopConfig } from '../services/configuracoes';

interface NavbarProps {
  currentUser: UserAccount | null;
  activeView: 'home' | 'quiz' | 'admin' | 'my-appointments';
  setActiveView: (view: 'home' | 'quiz' | 'admin' | 'my-appointments') => void;
  openAuthModal: () => void;
  handleLogout: () => void;
  realtimeActive: boolean;
  onOpenAdminSidebar?: () => void;
  onOpenClientDrawer?: () => void;
  shopConfig?: ShopConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  openAuthModal,
  handleLogout,
  realtimeActive,
  onOpenAdminSidebar,
  onOpenClientDrawer,
  shopConfig,
}) => {
  const isCustomLogo = Boolean(shopConfig?.useCustomLogo && shopConfig?.logoUrl);
  const logoPosition = shopConfig?.logoPosition || 'left';
  const logoSize = Math.min(Math.max(shopConfig?.logoSize || 40, 20), 150);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0A] h-[73px] overflow-visible rounded-b-3xl sm:rounded-b-[2.5rem] shadow-[0_4px_25px_rgba(0,0,0,0.5)] relative">
      {/* Animated Gold Contour Border (Sides and Rounded Bottom Edge - Completely No Top) */}
      <div className="absolute -inset-[2px] top-0 rounded-b-3xl sm:rounded-b-[2.5rem] p-[2px] animate-gold-flow pointer-events-none [clip-path:polygon(-10px_10px,calc(100%+10px)_10px,calc(100%+10px)_calc(100%+10px),-10px_calc(100%+10px))] shadow-[0_0_15px_rgba(234,179,8,0.4)]">
        <div className="w-full h-full bg-[#0A0A0A]/95 backdrop-blur-md rounded-b-[calc(1.5rem-2px)] sm:rounded-b-[calc(2.5rem-2px)]" />
      </div>
      
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 h-[73px] overflow-visible">
        
        {/* Brand Logo / Custom Image Container */}
        <div className={`flex items-center min-w-0 shrink overflow-visible h-[52px] relative ${
          logoPosition === 'center' ? 'flex-1 justify-center' : logoPosition === 'right' ? 'flex-1 justify-end' : ''
        }`}>
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 sm:gap-3 text-left transition-opacity hover:opacity-90 focus:outline-none shrink cursor-pointer relative"
          >
            {isCustomLogo ? (
              <img
                src={shopConfig?.logoUrl}
                alt={shopConfig?.shopName || "Logo Barbearia"}
                style={{ height: `${logoSize}px` }}
                className="w-auto object-contain transition-all max-w-[240px] sm:max-w-[320px] shrink-0"
              />
            ) : (
              <>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold text-lg sm:text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  <Scissors className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-syne text-sm sm:text-lg font-bold tracking-tight text-white uppercase truncate">
                    {shopConfig?.shopName ? shopConfig.shopName : <>JADSON <span className="text-yellow-400">BARBER</span></>}
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold tracking-wider text-gray-400 uppercase truncate">
                    {shopConfig?.shopTagline || 'Slim Experience'}
                  </p>
                </div>
              </>
            )}
          </button>
        </div>

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

          {currentUser && (
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
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Live Sync Status */}
          <div className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-gray-400 sm:flex">
            <Radio className={`h-3 w-3 ${realtimeActive ? 'animate-pulse text-yellow-400' : 'text-gray-600'}`} />
            <span>{realtimeActive ? 'Base Live' : 'Online'}</span>
          </div>

          {/* User Logged or Discreet Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => {
                  if (currentUser.role === 'admin') {
                    setActiveView('admin');
                  } else if (onOpenClientDrawer) {
                    onOpenClientDrawer();
                  }
                }}
                className="text-right flex flex-col justify-center cursor-pointer focus:outline-none min-w-0 max-w-[100px] sm:max-w-[180px]"
                title={currentUser.name}
              >
                <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">{currentUser.name}</p>
                <p className="text-[9px] sm:text-[10px] text-yellow-400 uppercase tracking-wider font-bold truncate">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </button>

              {currentUser.role === 'admin' && activeView === 'admin' && onOpenAdminSidebar && (
                <button
                  onClick={onOpenAdminSidebar}
                  title="Abrir Menu ADM"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] shrink-0"
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-[11px] sm:text-xs text-yellow-500/90 hover:text-yellow-400 font-medium px-2.5 py-1 border border-yellow-500/20 rounded-full transition-all uppercase tracking-wider flex items-center gap-1 hover:border-yellow-500/40"
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
