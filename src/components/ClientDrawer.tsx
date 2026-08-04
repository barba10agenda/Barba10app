import React from 'react';
import { 
  X, 
  Home, 
  Scissors, 
  CalendarCheck2, 
  ShieldCheck, 
  LogOut, 
  User, 
  ChevronRight,
  Phone,
  Instagram,
  MapPin,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { ShopConfig } from '../services/configuracoes';

interface ClientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  activeView: 'home' | 'quiz' | 'admin' | 'my-appointments';
  setActiveView: (view: 'home' | 'quiz' | 'admin' | 'my-appointments') => void;
  onLogout: () => void;
  shopConfig?: ShopConfig;
  appointmentCount?: number;
}

export const ClientDrawer: React.FC<ClientDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeView,
  setActiveView,
  onLogout,
  shopConfig,
  appointmentCount = 0,
}) => {
  if (!isOpen || !currentUser) return null;

  const handleNavigate = (view: 'home' | 'quiz' | 'admin' | 'my-appointments') => {
    setActiveView(view);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-zinc-950 border-r border-yellow-500/20 h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                Menu do Cliente
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-zinc-900/90 p-3.5 rounded-2xl border border-yellow-500/20 shadow-inner">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-syne text-sm font-bold text-white truncate">
                {currentUser.name}
              </h3>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentUser.email || currentUser.phone || 'Cliente Conectado'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Cliente VIP'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="p-4 space-y-2 flex-1">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">
            Navegação Principal
          </p>

          {/* Início */}
          <button
            onClick={() => handleNavigate('home')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'home'
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-yellow-400" />
              <span>Início</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          {/* Agendar Horário */}
          <button
            onClick={() => handleNavigate('quiz')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'quiz'
                ? 'bg-yellow-400 text-black border border-yellow-400 font-extrabold shadow-lg shadow-yellow-500/10'
                : 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <Scissors className="h-4 w-4" />
              <span>Agendar Novo Horário</span>
            </div>
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Meus Agendamentos */}
          <button
            onClick={() => handleNavigate('my-appointments')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'my-appointments'
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarCheck2 className="h-4 w-4 text-yellow-400" />
              <span>Meus Agendamentos</span>
            </div>
            {appointmentCount > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {appointmentCount}
              </span>
            )}
          </button>

          {/* Painel Administrativo (if admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => handleNavigate('admin')}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer mt-4 ${
                activeView === 'admin'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md'
                  : 'text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>Painel do Administrador</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          )}
        </div>

        {/* Footer & Logout */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 space-y-3">
          <div className="text-[11px] text-zinc-300 space-y-2 px-2 rounded-xl bg-zinc-900/50 p-3 border border-zinc-800/80">
            <p className="font-syne font-extrabold text-white uppercase text-xs tracking-wider">
              {shopConfig?.shopName || 'Jadson Barber'}
            </p>
            <p className="flex items-center gap-2 text-zinc-300 text-[11px] font-medium">
              <Phone className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              <span>{shopConfig?.phone || '(11) 99999-2525'}</span>
            </p>
            <p className="flex items-center gap-2 text-zinc-300 text-[11px] font-medium">
              <Instagram className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
              <span>{shopConfig?.instagram || '@jadsonbarber'}</span>
            </p>
            {shopConfig?.address && (
              <p className="flex items-start gap-2 text-zinc-300 text-[11px] font-medium">
                <MapPin className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{shopConfig.address}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair da Conta</span>
          </button>
        </div>

      </div>
    </div>
  );
};
