/**
 * Procedural Audio Synthesizer for THE LAST SIGNAL
 * Uses standard Web Audio API oscillators and noise buffers.
 * Completely zero-asset, zero-network, works offline and in all modern browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.65;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneLFO: OscillatorNode | null = null;
  private isDroneActive: boolean = false;

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  public setMute(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMute(!this.isMuted);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Start atmospheric eerie dark frequency drone
   */
  public startAmbientDrone(): void {
    if (this.isDroneActive) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      this.isDroneActive = true;
      const now = this.ctx.currentTime;

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.28, now + 3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      filter.Q.setValueAtTime(4, now);

      // Deep sub oscillator (55Hz / A1)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(55, now);

      // Detuned oscillator (54.2Hz) for unsettling binaural beating
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(54.1, now);

      // Low-frequency oscillator for subtle pulsating dread
      this.droneLFO = this.ctx.createOscillator();
      this.droneLFO.frequency.setValueAtTime(0.18, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(45, now);
      this.droneLFO.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneLFO.start(now);
    } catch (e) {
      console.warn('Failed to start ambient drone:', e);
    }
  }

  public stopAmbientDrone(): void {
    if (!this.isDroneActive || !this.ctx || !this.droneGain) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.setTargetAtTime(0.001, now, 0.5);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneLFO?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneLFO?.disconnect();
          this.isDroneActive = false;
        } catch {
          // ignore
        }
      }, 600);
    } catch {
      this.isDroneActive = false;
    }
  }

  /**
   * Mechanical click / keystroke / cassette button press
   */
  public playClick(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Glitch / static radio burst
   */
  public playStatic(duration = 0.25): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Heartbeat thumping effect (lub-dub)
   */
  public playHeartbeat(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const pulse = (timeOffset: number, baseFreq: number, intensity: number) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(32, now + timeOffset + 0.15);

      gain.gain.setValueAtTime(0.001, now + timeOffset);
      gain.gain.linearRampToValueAtTime(intensity, now + timeOffset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.25);
    };

    pulse(0, 68, 0.45);
    pulse(0.18, 52, 0.32);
  }

  /**
   * Atmospheric chime for puzzle success / clue discovery
   */
  public playChime(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freqs = [330, 440, 523.25, 659.25];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.3);
    });
  }

  /**
   * Radio tuning harmonic sweep
   */
  public playRadioSweep(freqRatio = 0.5): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const targetHz = 300 + freqRatio * 1200;
    osc.frequency.setValueAtTime(targetHz - 80, now);
    osc.frequency.linearRampToValueAtTime(targetHz, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(targetHz, now);
    filter.Q.setValueAtTime(5, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Dramatic suspense stinger for critical revelations
   */
  public playStinger(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Dissonant tritone chord
    const chord = [110, 155.56, 220, 311.13];

    chord.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.9);
    });
  }
}

export const sound = new SoundEngine();
