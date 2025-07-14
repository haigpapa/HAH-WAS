
import { useCallback, useRef } from 'react';
import { sounds } from '../sounds';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

type SoundBuffers = {
  select: AudioBuffer | null;
  correct: AudioBuffer | null;
  incorrect: AudioBuffer | null;
  levelUp: AudioBuffer | null;
  xpSpend: AudioBuffer | null;
};

// A helper to decode base64 to ArrayBuffer, which is needed for the Web Audio API
const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

export const useSounds = (isEnabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<SoundBuffers>({ select: null, correct: null, incorrect: null, levelUp: null, xpSpend: null });
  const isInitialized = useRef(false);

  // This function is now explicitly called on a user interaction (e.g., button click)
  const initAudio = useCallback(async () => {
    if (isInitialized.current || typeof window === 'undefined') return;

    try {
      // Create and store the audio context
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      // Decode all sounds in parallel for efficiency
      const [selectBuffer, correctBuffer, incorrectBuffer, levelUpBuffer, xpSpendBuffer] = await Promise.all([
          context.decodeAudioData(base64ToArrayBuffer(sounds.select)),
          context.decodeAudioData(base64ToArrayBuffer(sounds.correct)),
          context.decodeAudioData(base64ToArrayBuffer(sounds.incorrect)),
          context.decodeAudioData(base64ToArrayBuffer(sounds.levelUp)),
          context.decodeAudioData(base64ToArrayBuffer(sounds.xpSpend)),
      ]);

      soundBuffersRef.current = {
          select: selectBuffer,
          correct: correctBuffer,
          incorrect: incorrectBuffer,
          levelUp: levelUpBuffer,
          xpSpend: xpSpendBuffer,
      };
      
      // The most reliable way to unlock the audio context is to play a silent sound buffer.
      // This must be done in response to a user gesture.
      const buffer = context.createBuffer(1, 1, 22050);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
      
      isInitialized.current = true;
      console.log("Audio system explicitly unlocked by user action.");
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
    }
  }, []);

  const playSound = useCallback((sound: keyof SoundBuffers) => {
    if (isEnabled) {
      const context = audioContextRef.current;
      const buffer = soundBuffersRef.current[sound];

      if (!context || !buffer || !isInitialized.current) {
        console.warn(`Audio not initialized or sound not ready. Cannot play: ${sound}`);
      } else {
        if (context.state === 'suspended') {
            context.resume();
        }

        const source = context.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = context.createGain();
        if (sound === 'select') gainNode.gain.value = 0.5;
        if (sound === 'correct') gainNode.gain.value = 0.6;
        if (sound === 'incorrect') gainNode.gain.value = 0.4;
        if (sound === 'levelUp') gainNode.gain.value = 0.7;
        if (sound === 'xpSpend') gainNode.gain.value = 0.5;
        
        source.connect(gainNode);
        gainNode.connect(context.destination);
        
        source.start(0);
      }
    }

    // Trigger haptic feedback regardless of sound setting
    try {
        if (sound === 'correct' || sound === 'levelUp') {
            Haptics.impact({ style: ImpactStyle.Light });
        } else if (sound === 'incorrect') {
            Haptics.impact({ style: ImpactStyle.Heavy });
        } else if (sound === 'select' || sound === 'xpSpend') {
            Haptics.impact({ style: ImpactStyle.Medium });
        }
    } catch (error) {
        console.warn('Haptic feedback not available.', error);
    }
  }, [isEnabled]);

  return {
    initAudio, // Expose the initialization function
    playSelect: () => playSound('select'),
    playCorrect: () => playSound('correct'),
    playIncorrect: () => playSound('incorrect'),
    playLevelUp: () => playSound('levelUp'),
    playXpSpend: () => playSound('xpSpend'),
  };
};