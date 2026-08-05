/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroReception } from './components/HeroReception';
import { BookingQuiz } from './components/BookingQuiz';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { ClientAppointments } from './components/ClientAppointments';
import { ClientDrawer } from './components/ClientDrawer';
import { 
  getStoredAppointments,
  getStoredServices,
  getStoredBarbers,
  getStoredBlockedSlots,
  getStoredShopConfig,
  getCurrentUser, setCurrentUser,
  subscribeRealTime,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  removeAppointment,
  saveService,
  removeService,
  saveBarber,
  removeBarber,
  toggleBlockedSlot
} from './services/store';
import { testConnection } from './firebase/testConnection';
import { logoutUser } from './firebase/auth';
import { ShopConfig, saveShopConfig } from './services/configuracoes';
import { Appointment, Service, Barber, BlockedSlot, UserAccount, AppointmentStatus } from './types';
import { Scissors, Home, CalendarCheck2, ShieldCheck, MapPin, Phone, Instagram, Clock, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState<'home' | 'quiz' | 'admin' | 'my-appointments'>('home');

  // Initial Quiz service selection helper
  const [initialQuizServiceId, setInitialQuizServiceId] = useState<string | null>(null);

  // Auth State
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState<boolean>(false);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState<boolean>(false);

  // Store Data States
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStoredAppointments());
  const [services, setServices] = useState<Service[]>(() => getStoredServices());
  const [barbers, setBarbers] = useState<Barber[]>(() => getStoredBarbers());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => getStoredBlockedSlots());
  const [shopConfig, setShopConfig] = useState<ShopConfig>(() => getStoredShopConfig());

  // Real-time listener setup & Firestore connection check
  useEffect(() => {
    testConnection();

    const reloadAllData = () => {
      setAppointments(getStoredAppointments());
      setServices(getStoredServices());
      setBarbers(getStoredBarbers());
      setBlockedSlots(getStoredBlockedSlots());
      setShopConfig(getStoredShopConfig());
      setCurrentUserState(getCurrentUser());
    };

    const unsubscribe = subscribeRealTime(reloadAllData);
    return () => unsubscribe();
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveView('admin');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Firebase logout notice:', err);
    }
    setCurrentUserState(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jadson_barber_user_v1');
      localStorage.removeItem('jadson_barber_admin_account');
    }
    setIsAdminSidebarOpen(false);
    setActiveView('home');
  };

  // Appointment Actions with Firestore
  const handleConfirmBooking = async (bookingData: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      await createAppointment(bookingData);
    } catch (err: any) {
      alert(err?.message || 'Erro ao realizar agendamento no servidor.');
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(id, status);
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    await updateAppointment(id, updates);
  };

  const handleDeleteAppointment = async (id: string) => {
    await removeAppointment(id);
  };

  // Blocked Slot Actions with Firestore
  const handleToggleBlockSlot = async (date: string, timeSlot: string, barberId?: string) => {
    const slot: BlockedSlot = { date, timeSlot, barberId };
    await toggleBlockedSlot(slot, blockedSlots);
  };

  // Service Actions with Firestore
  const handleSaveService = async (serviceToSave: Service) => {
    await saveService(serviceToSave);
  };

  const handleDeleteService = async (id: string) => {
    await removeService(id);
  };

  // Barber Actions with Firestore
  const handleSaveBarber = async (barberToSave: Barber) => {
    await saveBarber(barberToSave);
  };

  const handleDeleteBarber = async (id: string) => {
    await removeBarber(id);
  };

  // Start Quiz Handler
  const handleStartQuiz = (serviceId?: string) => {
    if (serviceId) setInitialQuizServiceId(serviceId);
    else setInitialQuizServiceId(null);
    setActiveView('quiz');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        openAuthModal={() => setIsAuthModalOpen(true)}
        handleLogout={handleLogout}
        realtimeActive={true}
        onOpenAdminSidebar={() => setIsAdminSidebarOpen(true)}
        onOpenClientDrawer={() => setIsClientDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 pb-24 md:pb-12 sm:px-6 lg:px-8">
        
        {activeView === 'home' && (
          <HeroReception
            onStartQuiz={handleStartQuiz}
            services={services}
            barbers={barbers}
            onSelectServiceQuiz={(srvId) => handleStartQuiz(srvId)}
            shopConfig={shopConfig}
          />
        )}

        {activeView === 'quiz' && (
          <BookingQuiz
            services={services}
            barbers={barbers}
            appointments={appointments}
            blockedSlots={blockedSlots}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onConfirmBooking={handleConfirmBooking}
            initialServiceId={initialQuizServiceId}
            onCancel={() => setActiveView('home')}
          />
        )}

        {activeView === 'my-appointments' && currentUser && (
          <ClientAppointments
            currentUser={currentUser}
            appointments={appointments}
            services={services}
            barbers={barbers}
            blockedSlots={blockedSlots}
            onCancelAppointment={(id) => handleUpdateAppointmentStatus(id, 'cancelado')}
            onUpdateAppointment={handleUpdateAppointment}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            appointments={appointments}
            services={services}
            barbers={barbers}
            blockedSlots={blockedSlots}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onToggleBlockSlot={handleToggleBlockSlot}
            onSaveService={handleSaveService}
            onDeleteService={handleDeleteService}
            onSaveBarber={handleSaveBarber}
            onDeleteBarber={handleDeleteBarber}
            realtimeActive={true}
            currentUser={currentUser}
            onLogout={handleLogout}
            isSidebarOpen={isAdminSidebarOpen}
            setIsSidebarOpen={setIsAdminSidebarOpen}
            shopConfig={shopConfig}
            onSaveShopConfig={saveShopConfig}
          />
        )}

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Client Side Drawer / Menu Lateral */}
      <ClientDrawer
        isOpen={isClientDrawerOpen}
        onClose={() => setIsClientDrawerOpen(false)}
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        shopConfig={shopConfig}
        appointmentCount={appointments.filter(a => currentUser && (a.clientEmail === currentUser.email || a.clientPhone === currentUser.phone) && a.status !== 'cancelado').length}
      />

      {/* Footer */}
      <footer className={`border-t border-white/10 bg-[#080808]/90 py-10 mt-auto ${activeView !== 'admin' ? 'mb-14 md:mb-0' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-white/5 pb-6">
            {/* Top: Brand & Logo */}
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-zinc-950 font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)] shrink-0">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-syne text-lg font-bold text-white tracking-wider uppercase block">
                  {shopConfig?.shopName || 'JADSON BARBER'}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{shopConfig?.shopTagline || 'Atendimento Slim VIP'}</p>
              </div>
            </div>

            {/* Below Title: Contact Data */}
            <div className="flex flex-col items-start gap-2 text-xs text-gray-300">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400 shrink-0" /> {shopConfig?.address || 'Av. Principal, 1000 - Centro'}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400 shrink-0" /> {shopConfig?.phone || '(11) 99999-2525'}
              </span>
              <span className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-yellow-400 shrink-0" /> {shopConfig?.instagram || '@jadsonbarber'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
            <p>© {new Date().getFullYear()} {shopConfig?.shopName || 'Jadson Barber'}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Quick Access Bar (hidden on ADM panel) */}
      {activeView !== 'admin' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-yellow-500/20 px-2 py-1 flex items-center justify-around shadow-[0_-8px_20px_rgba(0,0,0,0.8)] md:hidden h-14">
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
              activeView === 'home'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-black scale-105'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveView('quiz')}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
              activeView === 'quiz'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-black scale-105'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="h-4 w-4" />
            <span>Agendar</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveView('my-appointments')}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                activeView === 'my-appointments'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-black scale-105'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>Agenda</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-black scale-105'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Painel</span>
            </button>
          )}
        </nav>
      )}

    </div>
  );
}
