// Sound notification utility for new appointments (Admin only)

let previousAppointmentIds: Set<string> | null = null;
let isAudioContextInitialized = false;
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!globalAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        globalAudioCtx = new AudioCtx();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch (err) {
    console.warn('AudioContext error:', err);
    return null;
  }
}

// Enable audio context on any user click anywhere in the admin area
if (typeof window !== 'undefined') {
  const initAudioOnInteraction = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running') {
      isAudioContextInitialized = true;
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('touchstart', initAudioOnInteraction);
    }
  };
  window.addEventListener('click', initAudioOnInteraction, { passive: true });
  window.addEventListener('touchstart', initAudioOnInteraction, { passive: true });
}

export function playAppointmentNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // High-quality double/triple bell sound (Agendamento Chime)
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);

    // Note 3: E6 (1318.51 Hz) - Celebratory bell chime
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, now + 0.3);
    gain3.gain.setValueAtTime(0.45, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.9);
  } catch (err) {
    console.warn('Efeito sonoro não pôde ser reproduzido:', err);
  }
}

export function checkAndPlayNewAppointmentSound(newAppointments: any[], currentUserRole?: string) {
  if (!newAppointments || !Array.isArray(newAppointments)) return;

  const currentIds = new Set(newAppointments.map(a => a.id).filter(Boolean));

  if (previousAppointmentIds === null) {
    // Initial load, just track existing IDs so sound doesn't trigger on initial load
    previousAppointmentIds = currentIds;
    return;
  }

  // Check if there are newly added appointment IDs
  let hasNewAppointment = false;
  for (const id of currentIds) {
    if (!previousAppointmentIds.has(id)) {
      hasNewAppointment = true;
      break;
    }
  }

  previousAppointmentIds = currentIds;

  // Determine if admin is logged in
  let isAdminLogged = currentUserRole === 'admin';

  if (!isAdminLogged && typeof window !== 'undefined') {
    const rawUser = localStorage.getItem('jadson_barber_user_v1');
    if (rawUser && rawUser.includes('"admin"')) {
      isAdminLogged = true;
    }
  }

  if (hasNewAppointment && isAdminLogged) {
    playAppointmentNotificationSound();
  }
}
