import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Scissors, KeyRound } from 'lucide-react';
import { UserAccount } from '../types';
import { loginWithEmail, registerWithEmail, saveUserProfile } from '../firebase/auth';

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

  // Handle 5-click easter egg on scissors icon
  const handleScissorsClick = () => {
    const nextCount = scissorClicks + 1;
    if (nextCount >= 5) {
      setScissorClicks(0);
      autofillAdminCredentials();
    } else {
      setScissorClicks(nextCount);
    }
  };

  // Handle client login/register submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'admin') {
        if (
          email.trim().toLowerCase() === 'barbeariajadsonbarber@gmail.com' &&
          password.trim() === '252525'
        ) {
          const adminUser: UserAccount = {
            id: 'admin-jadson',
            name: 'Jadson Barber (Admin)',
            email: 'barbeariajadsonbarber@gmail.com',
            phone: '(11) 99999-2525',
            role: 'admin',
          };
          await saveUserProfile(adminUser).catch(console.error);
          onLoginSuccess(adminUser);
          onClose();
        } else {
          setErrorMsg('E-mail ou senha da Barbearia incorretos. Verifique e tente novamente.');
        }
        setIsLoading(false);
        return;
      }

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
          // Fallback if password or Auth not created yet
          const clientUser: UserAccount = {
            id: 'cli-' + Math.random().toString(36).substring(2, 8),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            phone: phone || '(11) 98888-7777',
            role: email.toLowerCase() === 'barbeariajadsonbarber@gmail.com' ? 'admin' : 'client',
          };
          await saveUserProfile(clientUser).catch(console.error);
          onLoginSuccess(clientUser);
          onClose();
        }
      } else {
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

  // Quick autofill for Admin Credentials
  const autofillAdminCredentials = () => {
    setMode('admin');
    setEmail('barbeariajadsonbarber@gmail.com');
    setPassword('252525');
    setErrorMsg('');
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
              ? 'Acesso Barbearia'
              : mode === 'login'
              ? 'Acesso ao Portal'
              : 'Criar Cadastro'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'admin'
              ? 'Acesso exclusivo para administradores e barbeiros'
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

        {/* Form Fields */}
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
              {mode === 'admin' ? 'E-mail da Barbearia' : 'E-mail ou Telefone'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder={mode === 'admin' ? 'barbeariajadsonbarber@gmail.com' : 'exemplo@email.com'}
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

          {mode === 'admin' && (
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-[11px] text-yellow-300 space-y-1">
              <p className="font-bold uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-yellow-400" /> Credenciais da Barbearia:
              </p>
              <p>Email: <code className="text-white font-mono">barbeariajadsonbarber@gmail.com</code></p>
              <p>Senha: <code className="text-white font-mono">252525</code></p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors rounded-lg shadow-lg"
          >
            {mode === 'admin'
              ? 'Acessar Painel Admin'
              : mode === 'login'
              ? 'Acessar Minha Conta'
              : 'Criar Cadastro e Agendar'}
          </button>
        </form>

      </div>
    </div>
  );
};
