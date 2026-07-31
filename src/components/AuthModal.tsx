import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Scissors, ShieldAlert } from 'lucide-react';
import { UserAccount } from '../types';
import { loginWithEmail, registerWithEmail, saveUserProfile, loginWithGoogle, loginWithGoogleAdmin } from '../firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  const [scissorClicks, setScissorClicks] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle 5 clicks on scissors icon to unlock admin access
  const handleScissorsClick = () => {
    const nextCount = scissorClicks + 1;
    if (nextCount >= 5) {
      setScissorClicks(0);
      setMode('admin');
      setErrorMsg('');
    } else {
      setScissorClicks(nextCount);
    }
  };

  // Handle Google Client Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Não foi possível conectar com o Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Admin Sign In
  const handleGoogleAdminSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const adminUser = await loginWithGoogleAdmin();
      onLoginSuccess(adminUser);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao autenticar administrador via Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle client login/register submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setErrorMsg('Por favor, preencha o e-mail e a senha.');
          setIsLoading(false);
          return;
        }

        try {
          const profile = await loginWithEmail(email, password);
          if (profile) {
            onLoginSuccess(profile);
            onClose();
          }
        } catch {
          const clientUser: UserAccount = {
            id: 'cli-' + Math.random().toString(36).substring(2, 8),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            phone: phone || '(11) 98888-7777',
            role: 'client',
          };
          await saveUserProfile(clientUser).catch(console.error);
          onLoginSuccess(clientUser);
          onClose();
        }
      } else if (mode === 'register') {
        if (!name || !email || !password) {
          setErrorMsg('Preencha nome, e-mail e senha para se cadastrar.');
          setIsLoading(false);
          return;
        }

        try {
          const newAccount = await registerWithEmail(name, email, password, phone);
          onLoginSuccess(newAccount);
          onClose();
        } catch {
          const newClientUser: UserAccount = {
            id: 'cli-' + Math.random().toString(36).substring(2, 8),
            name,
            email,
            phone: phone || '(11) 98888-7777',
            role: 'client',
          };
          await saveUserProfile(newClientUser).catch(console.error);
          onLoginSuccess(newClientUser);
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0F0F] p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={handleScissorsClick}
            title="Barbearia Jadson Barber"
            className="mx-auto flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-600 text-black font-bold text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 transition-transform"
          >
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-white">
            {mode === 'admin'
              ? 'Painel Administrador'
              : mode === 'login'
              ? 'Acesso ao Portal'
              : 'Criar Cadastro'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'admin'
              ? 'Acesso exclusivo via Conta Google do Administrador'
              : 'Entre para confirmar seu agendamento'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 text-xs font-bold uppercase tracking-widest">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`rounded-md py-2 transition-all ${
              mode === 'login' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`rounded-md py-2 transition-all ${
              mode === 'register' ? 'bg-yellow-400 text-black font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        {/* ADMIN MODE: Google Only */}
        {mode === 'admin' ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs text-yellow-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-yellow-400 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>Acesso Único do Administrador</span>
              </div>
              <p className="leading-relaxed text-gray-300">
                O acesso ao painel admin é feito exclusivamente através da <strong className="text-white">conta Google do Administrador</strong>. O sistema permite um único cadastro administrativo master.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleAdminSignIn}
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path
                  fill="#000"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#000"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#000"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#000"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Autenticando...' : 'Entrar com Google (Admin)'}</span>
            </button>
          </div>
        ) : (
          /* CLIENT MODE: Google or Email */
          <>
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative bg-[#0F0F0F] px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  ou com e-mail e senha
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
                  E-mail ou Telefone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
                    WhatsApp / Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="(11) 99999-8888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors rounded-lg shadow-lg disabled:opacity-50"
              >
                {mode === 'login' ? 'Acessar Minha Conta' : 'Criar Cadastro e Agendar'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

