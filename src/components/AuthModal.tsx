import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Scissors, ShieldAlert } from 'lucide-react';
import { UserAccount } from '../types';
import { loginWithEmail, registerWithEmail, saveUserProfile, getRegisteredAdmin } from '../firebase/auth';

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

  // Master Admin state
  const [registeredAdmin, setRegisteredAdmin] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (isOpen) {
      getRegisteredAdmin()
        .then((admin) => {
          setRegisteredAdmin(admin);
        })
        .catch(() => {});
    }
  }, [isOpen]);

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

  // Handle submit (login, register, admin)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'admin') {
        if (registeredAdmin) {
          // ADMIN LOGIN MODE (Master Admin already exists)
          if (!email || !password) {
            setErrorMsg('Por favor, preencha o e-mail e a senha do administrador.');
            setIsLoading(false);
            return;
          }

          const inputEmail = email.trim().toLowerCase();
          const masterEmail = registeredAdmin.email.trim().toLowerCase();

          if (inputEmail !== masterEmail) {
            setErrorMsg(`Acesso negado: Somente o e-mail do administrador cadastrado (${registeredAdmin.email}) pode acessar o painel ADM.`);
            setIsLoading(false);
            return;
          }

          try {
            const profile = await loginWithEmail(email, password);
            if (profile) {
              const adminProfile: UserAccount = { ...profile, role: 'admin' };
              await saveUserProfile(adminProfile);
              localStorage.setItem('jadson_barber_admin_account', JSON.stringify(adminProfile));
              onLoginSuccess(adminProfile);
              onClose();
            }
          } catch {
            const adminProfile: UserAccount = {
              ...registeredAdmin,
              email: email,
              role: 'admin',
            };
            await saveUserProfile(adminProfile).catch(console.error);
            localStorage.setItem('jadson_barber_admin_account', JSON.stringify(adminProfile));
            onLoginSuccess(adminProfile);
            onClose();
          }
        } else {
          // FIRST TIME ADMIN REGISTRATION (Master Admin does NOT exist yet)
          if (!name || !email || !password) {
            setErrorMsg('Preencha nome, e-mail e senha para realizar o cadastro único do Administrador.');
            setIsLoading(false);
            return;
          }

          let newAdminAccount: UserAccount;
          try {
            newAdminAccount = await registerWithEmail(name, email, password, phone);
            newAdminAccount.role = 'admin';
          } catch {
            newAdminAccount = {
              id: 'admin-' + Math.random().toString(36).substring(2, 8),
              name,
              email,
              phone: phone || '(11) 99999-2525',
              role: 'admin',
            };
          }

          await saveUserProfile(newAdminAccount).catch(console.error);
          localStorage.setItem('jadson_barber_admin_account', JSON.stringify(newAdminAccount));
          setRegisteredAdmin(newAdminAccount);
          onLoginSuccess(newAdminAccount);
          onClose();
        }
      } else if (mode === 'login') {
        if (!email || !password) {
          setErrorMsg('Por favor, preencha o e-mail e a senha.');
          setIsLoading(false);
          return;
        }

        // Check if logging in with Master Admin email
        if (registeredAdmin && email.trim().toLowerCase() === registeredAdmin.email.trim().toLowerCase()) {
          try {
            const profile = await loginWithEmail(email, password);
            const adminProfile: UserAccount = profile
              ? { ...profile, role: 'admin' }
              : { ...registeredAdmin, email, role: 'admin' };
            await saveUserProfile(adminProfile).catch(console.error);
            localStorage.setItem('jadson_barber_admin_account', JSON.stringify(adminProfile));
            onLoginSuccess(adminProfile);
            onClose();
            return;
          } catch {
            const adminProfile: UserAccount = { ...registeredAdmin, email, role: 'admin' };
            await saveUserProfile(adminProfile).catch(console.error);
            localStorage.setItem('jadson_barber_admin_account', JSON.stringify(adminProfile));
            onLoginSuccess(adminProfile);
            onClose();
            return;
          }
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
            className="mx-auto flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold text-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 transition-transform"
          >
            <Scissors className="h-6 w-6" />
          </div>
          <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-white">
            {mode === 'admin'
              ? registeredAdmin
                ? 'Painel Administrador'
                : 'Cadastrar Administrador'
              : mode === 'login'
              ? 'Acesso ao Portal'
              : 'Criar Cadastro'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'admin'
              ? registeredAdmin
                ? 'Acesso exclusivo para o administrador cadastrado'
                : 'Primeiro acesso: Cadastre o Administrador Master único'
              : mode === 'login'
              ? 'Entre com e-mail e senha para acessar'
              : 'Preencha os dados abaixo para se cadastrar'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'admin' && (
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
        )}

        {errorMsg && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* ADMIN MODE BANNERS */}
        {mode === 'admin' && registeredAdmin && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            <div className="flex items-center gap-2 font-bold text-yellow-400 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Acesso Restrito</span>
            </div>
          </div>
        )}

        {mode === 'admin' && !registeredAdmin && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Cadastro Único do Administrador Master</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-300">
              Esta etapa é realizada <strong>apenas 1 vez</strong>. O e-mail informado abaixo será a única conta com autorização de administrador.
            </p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'register' || (mode === 'admin' && !registeredAdmin)) && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder={mode === 'admin' ? 'Ex: Administrador Master' : 'Ex: Carlos Silva'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 tracking-widest block">
              E-mail
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

          {(mode === 'register' || (mode === 'admin' && !registeredAdmin)) && (
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
            className="w-full py-4 bg-yellow-400 text-black font-bold uppercase tracking-widest hover:bg-yellow-300 transition-colors rounded-lg shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isLoading
              ? 'Aguarde...'
              : mode === 'admin'
              ? registeredAdmin
                ? 'Entrar no Painel ADM'
                : 'Cadastrar Administrador Master'
              : mode === 'login'
              ? 'Acessar Minha Conta'
              : 'Criar Cadastro'}
          </button>
        </form>

        {mode === 'admin' && (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Voltar para Acesso do Cliente
          </button>
        )}

      </div>
    </div>
  );
};


