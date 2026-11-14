/**
 * Procedural 8-Bit Web Audio Engine
 *
 * Synthesizes retro chiptune audio in real time using the native Web Audio API.
 * Zero external audio files or dependencies required.
 */

class RetroAudioEngine {
	constructor() {
		this.ctx = null;
		this.isMuted = false;
		this.masterGain = null;
		this.lastStepTime = 0;
		this.lastBumpTime = 0;

		// Load mute preference from localStorage if available
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("retro_audio_muted");
				if (saved !== null) {
					this.isMuted = saved === "true";
				}
			} catch (e) {
				// Ignore storage errors in private browsing
			}
		}
	}

	init() {
		if (this.ctx) return;
		try {
			const AudioContextClass =
				window.AudioContext || window.webkitAudioContext;
			if (!AudioContextClass) return;
			this.ctx = new AudioContextClass();
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.setValueAtTime(
				this.isMuted ? 0 : 0.25,
				this.ctx.currentTime
			);
			this.masterGain.connect(this.ctx.destination);
		} catch (e) {
			console.warn("Web Audio not supported or blocked", e);
		}
	}

	ensureRunning() {
		this.init();
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume().catch(() => {});
		}
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(
				this.isMuted ? 0 : 0.25,
				this.ctx.currentTime
			);
		}
		try {
			localStorage.setItem("retro_audio_muted", String(this.isMuted));
		} catch (e) {}
		return this.isMuted;
	}

	setMuted(muted) {
		this.isMuted = muted;
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setValueAtTime(
				this.isMuted ? 0 : 0.25,
				this.ctx.currentTime
			);
		}
		try {
			localStorage.setItem("retro_audio_muted", String(this.isMuted));
		} catch (e) {}
	}

	getMuted() {
		return this.isMuted;
	}

	/**
	 * Play a synthesized tone or chord
	 */
	playTone({
		type = "square",
		startFreq = 440,
		endFreq = null,
		duration = 0.1,
		gain = 0.3,
		decay = true,
		delay = 0,
	}) {
		if (this.isMuted) return;
		this.ensureRunning();
		if (!this.ctx || !this.masterGain) return;

		const now = this.ctx.currentTime + delay;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(startFreq, now);
		if (endFreq && endFreq !== startFreq) {
			osc.frequency.exponentialRampToValueAtTime(
				Math.max(endFreq, 1),
				now + duration
			);
		}

		g.gain.setValueAtTime(gain, now);
		if (decay) {
			g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
		} else {
			g.gain.setValueAtTime(gain, now + duration * 0.8);
			g.gain.linearRampToValueAtTime(0.0001, now + duration);
		}

		osc.connect(g);
		g.connect(this.masterGain);

		osc.start(now);
		osc.stop(now + duration + 0.05);
	}

	/**
	 * Procedural white noise burst for impacts and explosions
	 */
	playNoise({ duration = 0.15, gain = 0.25, filterFreq = 1200 }) {
		if (this.isMuted) return;
		this.ensureRunning();
		if (!this.ctx || !this.masterGain) return;

		const bufferSize = Math.floor(this.ctx.sampleRate * duration);
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
		filter.frequency.exponentialRampToValueAtTime(
			100,
			this.ctx.currentTime + duration
		);

		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, this.ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(
			0.0001,
			this.ctx.currentTime + duration
		);

		noise.connect(filter);
		filter.connect(g);
		g.connect(this.masterGain);

		noise.start();
	}

	// ----------------------------------------------------
	// Specific Retro Sound Effects
	// ----------------------------------------------------

	/** High arpeggiated coin chime */
	playCoin() {
		this.ensureRunning();
		// B5 (987Hz) then quickly E6 (1318Hz)
		this.playTone({
			type: "square",
			startFreq: 987,
			duration: 0.07,
			gain: 0.28,
		});
		this.playTone({
			type: "square",
			startFreq: 1318,
			duration: 0.35,
			gain: 0.3,
			delay: 0.07,
		});
	}

	/** Soft footstep tap */
	playStep() {
		const now = Date.now();
		if (now - this.lastStepTime < 180) return;
		this.lastStepTime = now;
		this.playTone({
			type: "triangle",
			startFreq: 110,
			endFreq: 55,
			duration: 0.04,
			gain: 0.08,
		});
	}

	/** Dull wall bump */
	playBump() {
		const now = Date.now();
		if (now - this.lastBumpTime < 240) return;
		this.lastBumpTime = now;
		this.playTone({
			type: "square",
			startFreq: 110,
			endFreq: 40,
			duration: 0.08,
			gain: 0.16,
		});
	}

	/** Fast whoosh for sprinting / dash */
	playDash() {
		this.playTone({
			type: "sawtooth",
			startFreq: 220,
			endFreq: 680,
			duration: 0.12,
			gain: 0.15,
		});
	}

	/** Upbeat door enter fanfare */
	playDoor() {
		const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
		notes.forEach((freq, idx) => {
			this.playTone({
				type: "square",
				startFreq: freq,
				duration: 0.1,
				gain: 0.25,
				delay: idx * 0.07,
			});
		});
	}

	/** NPC Dialogue chip-blip */
	playDialogue() {
		const pitches = [360, 420, 480, 540, 600];
		const freq = pitches[Math.floor(Math.random() * pitches.length)];
		this.playTone({
			type: "square",
			startFreq: freq,
			duration: 0.04,
			gain: 0.15,
		});
	}

	/** Interactive prompt chirp */
	playInteract() {
		this.playTone({
			type: "sine",
			startFreq: 587.33,
			endFreq: 880,
			duration: 0.12,
			gain: 0.22,
		});
	}

	/** Laser zap for squashing bugs in arcade */
	playLaser() {
		this.playTone({
			type: "sawtooth",
			startFreq: 920,
			endFreq: 160,
			duration: 0.1,
			gain: 0.22,
		});
	}

	/** Crunchy bug squelch / hit */
	playSquash() {
		this.playTone({
			type: "square",
			startFreq: 340,
			endFreq: 80,
			duration: 0.08,
			gain: 0.25,
		});
		this.playNoise({ duration: 0.09, gain: 0.2, filterFreq: 1800 });
	}

	/** Player hit / explosion */
	playExplosion() {
		this.playNoise({ duration: 0.28, gain: 0.35, filterFreq: 1200 });
		this.playTone({
			type: "sawtooth",
			startFreq: 140,
			endFreq: 40,
			duration: 0.25,
			gain: 0.2,
		});
	}

	/** Arcade mini-game powerup / bonus */
	playPowerup() {
		const notes = [440, 554, 659, 880];
		notes.forEach((freq, idx) => {
			this.playTone({
				type: "triangle",
				startFreq: freq,
				duration: 0.08,
				gain: 0.2,
				delay: idx * 0.05,
			});
		});
	}

	/** Sad descending game over cadence */
	playGameOver() {
		const notes = [415.3, 392.0, 369.99, 329.63]; // G#4, G4, F#4, E4
		notes.forEach((freq, idx) => {
			this.playTone({
				type: "square",
				startFreq: freq,
				duration: 0.2,
				gain: 0.25,
				delay: idx * 0.16,
			});
		});
	}

	/** Grand victory fanfare for finding all relics */
	playVictory() {
		const melody = [
			{ f: 523.25, d: 0.12, t: 0 },
			{ f: 659.25, d: 0.12, t: 0.12 },
			{ f: 783.99, d: 0.12, t: 0.24 },
			{ f: 1046.5, d: 0.35, t: 0.36 },
			{ f: 880.0, d: 0.15, t: 0.55 },
			{ f: 1046.5, d: 0.5, t: 0.72 },
		];
		melody.forEach((note) => {
			this.playTone({
				type: "square",
				startFreq: note.f,
				duration: note.d,
				gain: 0.3,
				delay: note.t,
			});
		});
	}

	/** Rising energy charge hum when forcing against borders to warp */
	playWarpCharge(progress = 0) {
		if (this.isMuted) return;
		this.ensureRunning();
		const startFreq = 220 + progress * 580;
		this.playTone({
			type: "sawtooth",
			startFreq,
			endFreq: startFreq + 100,
			duration: 0.08,
			gain: 0.12 + progress * 0.1,
		});
	}

	/** Supersonic hyperdrive warp boom when crossing border between pages */
	playWarpBoom() {
		if (this.isMuted) return;
		this.ensureRunning();
		// Low sub-bass warp drop
		this.playTone({
			type: "sine",
			startFreq: 300,
			endFreq: 45,
			duration: 0.5,
			gain: 0.35,
		});
		// White noise warp whoosh
		this.playNoise({ duration: 0.45, gain: 0.3, filterFreq: 2600 });
		// High laser streak
		this.playTone({
			type: "sawtooth",
			startFreq: 980,
			endFreq: 140,
			duration: 0.35,
			gain: 0.28,
			delay: 0.04,
		});
	}
}

export const audioEngine = new RetroAudioEngine();
