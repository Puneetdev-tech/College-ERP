/**
 * useSpeech – Web Speech API TTS & Audio Feedback Utility
 * Female voice preference + rich UI sound effects via Web Audio API
 */

// ─── Text-to-Speech ────────────────────────────────────────────────────────
// Prioritized female voice names (matched in order)
const FEMALE_VOICE_KEYWORDS = [
  "Google UK English Female",
  "Microsoft Zira",
  "Samantha",
  "Victoria",
  "Karen",
  "Moira",
  "Veena",
  "Fiona",
  "Google US English",
  "Female",
  "Woman",
];

// Preload voices immediately on load
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
}

function getBestFemaleVoice() {
  const voices = window.speechSynthesis.getVoices() || [];
  for (const keyword of FEMALE_VOICE_KEYWORDS) {
    const match = voices.find((v) =>
      v && v.name && v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (match) return match;
  }
  // Fallback: any English voice
  return voices.find((v) => v && v.lang && v.lang.startsWith("en")) || null;
}

export function speak(text, { rate = 0.93, pitch = 1.1, volume = 0.88 } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voiceEnabled = window.localStorage.getItem("rjit_voice_enabled") !== "false";
  if (!voiceEnabled) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const trySpeak = () => {
    const voice = getBestFemaleVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  trySpeak();
}

// ─── Web Audio UI Sounds ────────────────────────────────────────────────────
function createCtx() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

// Named beep/chime helper
export function playBeep(type = "success") {
  const voiceEnabled = typeof window !== "undefined" && window.localStorage.getItem("rjit_voice_enabled") !== "false";
  if (!voiceEnabled) return;
  const ctx = createCtx();
  if (!ctx) return;

  const t = ctx.currentTime;

  if (type === "success") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(523, t);
    osc.frequency.setValueAtTime(659, t + 0.1);
    osc.frequency.setValueAtTime(784, t + 0.2);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.start(t); osc.stop(t + 0.6);

  } else if (type === "security") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(440, t + 0.15);
    osc.frequency.setValueAtTime(660, t + 0.3);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.start(t); osc.stop(t + 0.7);

  } else if (type === "confirm") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.1);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t); osc.stop(t + 0.35);

  } else if (type === "error") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.setValueAtTime(100, t + 0.15);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t); osc.stop(t + 0.4);

  } else if (type === "order-placed") {
    // Triumphant 4-note ascending fanfare — order successfully placed
    [392, 523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.12);
      gain.gain.setValueAtTime(0.25, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.2);
      osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.2);
    });
    // Final sustain note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046, t + 0.5);
    gain2.gain.setValueAtTime(0.2, t + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    osc2.start(t + 0.5); osc2.stop(t + 1.1);

  } else if (type === "order-received") {
    // Cheerful uplifting chime — stock received into warehouse
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.22, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.18);
      osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.22);
    });

  } else if (type === "order-approved") {
    // Positive double-ping — approval confirmed
    [660, 990].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.18);
      gain.gain.setValueAtTime(0.26, t + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.3);
      osc.start(t + i * 0.18); osc.stop(t + i * 0.18 + 0.3);
    });

  } else if (type === "order-rejected") {
    // Heavy descending alert — rejection notice
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.45);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t); osc.stop(t + 0.5);
    // Second low thud
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(100, t + 0.5);
    gain2.gain.setValueAtTime(0.2, t + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    osc2.start(t + 0.5); osc2.stop(t + 0.75);

  } else if (type === "stock-issued") {
    // Swoosh + bright ping — item disbursed from stock
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(200, t);
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc1.start(t); osc1.stop(t + 0.18);
    // Bright ping after swoosh
    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + 0.2 + i * 0.12);
      gain.gain.setValueAtTime(0.2, t + 0.2 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 + i * 0.12 + 0.18);
      osc.start(t + 0.2 + i * 0.12); osc.stop(t + 0.2 + i * 0.12 + 0.18);
    });

  } else if (type === "low-stock-alert") {
    // Urgent warning buzzer — low stock detected
    [220, 180, 220, 180].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t + i * 0.15);
      gain.gain.setValueAtTime(0.18, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.12);
      osc.start(t + i * 0.15); osc.stop(t + i * 0.15 + 0.12);
    });

  } else if (type === "chat-send") {
    // Soft pop — chat message sent
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.1);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t); osc.stop(t + 0.12);

  } else if (type === "chat-receive") {
    // Gentle incoming ping — AI responds
    [523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.12, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12);
      osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.12);
    });
  } else if (type === "bell") {
    // TRING TRING — Classic double-ring school/desk bell sound
    // Each "tring" = sharp metallic strike + fast decay
    const playTring = (startTime) => {
      // Strike 1: High metallic ping (fundamental + overtone)
      [1400, 2100, 2800, 4200].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.18 - i * 0.03, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25 - i * 0.04);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
      // Add a quick metallic click transient at start
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = "square";
      click.frequency.setValueAtTime(3000, startTime);
      click.frequency.exponentialRampToValueAtTime(500, startTime + 0.015);
      clickGain.gain.setValueAtTime(0.25, startTime);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.018);
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(startTime);
      click.stop(startTime + 0.02);
    };
    // TRING... TRING (two rings with short gap)
    playTring(t);
    playTring(t + 0.38);
  }
}

// Rich UI sound effects for interaction feedback
export function playUISound(type) {
  const voiceEnabled = typeof window !== "undefined" && window.localStorage.getItem("rjit_voice_enabled") !== "false";
  if (!voiceEnabled) return;
  const ctx = createCtx();
  if (!ctx) return;

  const t = ctx.currentTime;

  if (type === "nav") {
    // Soft single click — sidebar navigation
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);

  } else if (type === "add") {
    // Two-tone up chime — item added
    [440, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.2, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.18);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.18);
    });

  } else if (type === "delete") {
    // Low descending tone — delete action
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.3);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);

  } else if (type === "modal-open") {
    // Ascending sweep — modal opens
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.2);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.setValueAtTime(0.08, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);

  } else if (type === "modal-close") {
    // Descending sweep — modal closes
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);

  } else if (type === "save") {
    // Triple ping — save action
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.18, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.12);
    });

  } else if (type === "toggle") {
    // Short click toggle
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.start(t);
    osc.stop(t + 0.07);

  } else if (type === "filter") {
    // Swoosh filter sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export default { speak, playBeep, playUISound };
