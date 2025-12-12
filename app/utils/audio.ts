export const playSound = (type: 'tick' | 'success' | 'fail') => {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'tick') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'success') {
    // Success: Ascending major arpeggio (C - E - G)
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, now);
    
    // Note 1
    osc.frequency.setValueAtTime(523.25, now); // C5
    // Note 2
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    // Note 3
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    
    gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
    
    // Add a second harmonic for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now);
    osc2.frequency.setValueAtTime(1046.50, now + 0.2); // Octave up
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.start(now);
    osc2.stop(now + 0.8);

  } else if (type === 'fail') {
    // Fail: Descending tones / dissonant
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.1, now);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
    osc.frequency.linearRampToValueAtTime(100, now + 0.6);
    
    gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.start(now);
    osc.stop(now + 0.8);
  }
};
