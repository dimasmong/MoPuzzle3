import { Persistence } from './persistence';

export class AudioEngine {
  private static instance: AudioEngine;
  private ctx: AudioContext | null = null;
  private isMutedSFX = false;
  private isMutedBGM = false;
  private sfxVolume = 0.8;
  private bgmVolume = 0.35;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private isUnlocked = false;

  private constructor() {
    const settings = Persistence.getInstance().getSettings();
    this.isMutedSFX = !settings.soundEnabled;
    this.isMutedBGM = !settings.musicEnabled;
    this.sfxVolume = settings.sfxVolume;
    this.bgmVolume = settings.musicVolume;

    // Attach unlock listener on window (first user interaction)
    const unlock = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isUnlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      if (!this.isMutedBGM) {
        this.startBGM();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isMutedSFX = !enabled;
    Persistence.getInstance().updateSettings({ soundEnabled: enabled });
  }

  public setMusicEnabled(enabled: boolean): void {
    this.isMutedBGM = !enabled;
    Persistence.getInstance().updateSettings({ musicEnabled: enabled });
    if (!enabled) {
      this.stopBGM();
    } else if (this.isUnlocked) {
      this.startBGM();
    }
  }

  public isSFXEnabled(): boolean {
    return !this.isMutedSFX;
  }

  public isBGMEnabled(): boolean {
    return !this.isMutedBGM;
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainLevel: number = 0.25,
    rampToZero: boolean = true
  ): void {
    if (this.isMutedSFX) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state === 'suspended') return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainLevel * this.sfxVolume, now);
      if (rampToZero) {
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio errors safely swallowed
    }
  }

  // Common UI SFX
  public playClick(): void {
    this.playTone(600, 'sine', 0.04, 0.18);
  }

  public playUndo(): void {
    if (this.isMutedSFX) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state === 'suspended') return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
      gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  public playHint(): void {
    if (this.isMutedSFX) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.14, 0.22), idx * 60);
    });
  }

  public playVictory(): void {
    if (this.isMutedSFX) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.3), idx * 75);
    });
  }

  public playCampaignComplete(): void {
    if (this.isMutedSFX) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.35, 0.35), idx * 80);
    });
  }

  public playError(): void {
    this.playTone(180, 'sawtooth', 0.1, 0.18);
  }

  // Sudoku SFX
  public playSudokuNumber(): void {
    this.playTone(520, 'sine', 0.05, 0.2);
  }

  public playSudokuNote(): void {
    this.playTone(740, 'triangle', 0.04, 0.15);
  }

  public playSudokuErase(): void {
    this.playTone(340, 'sine', 0.06, 0.15);
  }

  // Minesweeper SFX
  public playMineReveal(): void {
    this.playTone(480, 'sine', 0.04, 0.16);
  }

  public playMineFlag(): void {
    this.playTone(660, 'triangle', 0.08, 0.25);
  }

  public playMineExplode(): void {
    this.playTone(120, 'sawtooth', 0.25, 0.35);
  }

  public playMineChord(): void {
    this.playTone(580, 'triangle', 0.06, 0.2);
  }

  // Pipe Connect SFX
  public playPipeRotate(): void {
    this.playTone(620, 'triangle', 0.06, 0.2);
  }

  public playPipeFlow(): void {
    const notes = [440, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.12, 0.18), idx * 50);
    });
  }

  // Box Pusher SFX
  public playBoxStep(): void {
    this.playTone(280, 'sine', 0.04, 0.15);
  }

  public playBoxPush(): void {
    this.playTone(200, 'triangle', 0.08, 0.25);
  }

  public playBoxTarget(): void {
    this.playTone(880, 'triangle', 0.12, 0.3);
  }

  // Memory Flip SFX
  public playCardFlip(): void {
    this.playTone(420, 'sine', 0.05, 0.16);
  }

  public playCardMatch(): void {
    const notes = [659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.15, 0.25), idx * 70);
    });
  }

  public playCardMismatch(): void {
    this.playTone(260, 'sawtooth', 0.1, 0.18);
  }

  // Lights Out SFX
  public playLightToggle(): void {
    this.playTone(550, 'sine', 0.06, 0.22);
  }

  // Calm Ambient Procedural BGM
  public startBGM(): void {
    if (this.bgmTimer !== null) return;
    this.bgmStep = 0;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 261.63, 329.63, 392.0], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];

    const playChord = () => {
      if (this.isMutedBGM) return;
      const ctx = this.initContext();
      if (!ctx || ctx.state === 'suspended') return;

      try {
        const chord = chords[this.bgmStep % chords.length];
        this.bgmStep++;
        const now = ctx.currentTime;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.03 * this.bgmVolume, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 5.0);
        });
      } catch {}
    };

    playChord();
    this.bgmTimer = window.setInterval(playChord, 5200);
  }

  public stopBGM(): void {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}
