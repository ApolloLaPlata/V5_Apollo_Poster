/**
 * webAudioSynthesizer.ts - Sintetizador Web Audio API Nativo para Pré-escuta de Trilhas Virais
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Gera batidas rítmicas e sintetizadores em tempo real diretamente no navegador
 * sem dependência de arquivos MP3 pesados ou conexões de rede externas.
 * Sincronizado dinamicamente com o BPM e a vibe de cada trilha do catálogo.
 */

class WebAudioPreviewEngine {
  private audioCtx: AudioContext | null = null;
  private timerId: number | null = null;
  private currentTrackId: string | null = null;
  private masterGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Dispara um kick sintetizado de sub-grave (punch)
   */
  private triggerKick(ctx: AudioContext, time: number, master: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(master);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  /**
   * Dispara um chimbal / hi-hat nítido de alta frequência
   */
  private triggerHat(ctx: AudioContext, time: number, master: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(master);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  /**
   * Dispara uma nota de baixo / sintetizador melódico
   */
  private triggerBassNote(ctx: AudioContext, time: number, freq: number, type: OscillatorType, master: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + 0.25);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  /**
   * Inicia o playback do beat procedural calibrado no BPM e categoria
   */
  public playTrackPreview(trackId: string, bpm: number, category: string): boolean {
    this.stopPreview();

    const ctx = this.initContext();
    if (!ctx) return false;

    this.currentTrackId = trackId;

    // Master Gain com volume seguro e agradável
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.18, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    const intervalSec = 60 / bpm; // Tempo de cada batida em segundos
    let step = 0;

    // Escala de frequências de baixo conforme o estilo
    const bassScales: Record<string, number[]> = {
      tech_ai: [65.41, 77.78, 87.31, 98.0], // C2, Eb2, F2, G2 (Cyber Minimal)
      motivation_drill: [55.0, 61.74, 73.42, 82.41], // A1, B1, D2, E2 (Dark Drill)
      cinematic_tension: [43.65, 49.0, 58.27, 65.41], // F1, G1, Bb1, C2 (Sub Tension)
      apollo_exclusive: [65.41, 82.41, 98.0, 110.0]  // C2, E2, G2, A2 (Groove Apollo)
    };

    const notes = bassScales[category] || bassScales.tech_ai;
    const oscType: OscillatorType = category === "motivation_drill" ? "sawtooth" : "sine";

    const playStep = () => {
      if (!this.audioCtx || this.currentTrackId !== trackId) return;
      const now = this.audioCtx.currentTime;

      // 1. Kick a cada batida forte (compasso 4/4)
      if (step % 4 === 0 || (category === "motivation_drill" && step % 4 === 2)) {
        this.triggerKick(this.audioCtx, now, master);
      }

      // 2. Hi-hat em contratempos
      if (step % 2 === 1 || category === "tech_ai") {
        this.triggerHat(this.audioCtx, now, master);
      }

      // 3. Linha de baixo procedural
      const noteFreq = notes[step % notes.length];
      this.triggerBassNote(this.audioCtx, now, noteFreq, oscType, master);

      step = (step + 1) % 16;
    };

    // Executa a primeira batida imediatamente
    playStep();

    // Roda em loop sincronizado no BPM
    this.timerId = window.setInterval(playStep, (intervalSec * 1000) / 2);
    return true;
  }

  /**
   * Interrompe qualquer som ativo com fade out suave para evitar estalo
   */
  public stopPreview() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioCtx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
      } catch {
        // silencioso
      }
    }
    this.currentTrackId = null;
  }

  public getPlayingTrackId(): string | null {
    return this.currentTrackId;
  }
}

export const globalAudioSynthesizer = new WebAudioPreviewEngine();
