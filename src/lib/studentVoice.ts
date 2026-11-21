
export interface StudentVoiceListenerOptions {
  onSpeechStart: () => void;
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
}

export class StudentVoiceListener {
  private options: StudentVoiceListenerOptions;

  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private silentGain: GainNode | null = null;

  private animationFrameId: number | null = null;

  private preRollChunks: Float32Array[] = [];
  private preRollSampleCount = 0;

  private recordingChunks: Float32Array[] = [];
  private recordingSampleCount = 0;

  private isActive = false;
  private isRecording = false;
  private isFinalizing = false;

  private speechStartedAt = 0;
  private lastVoiceAt = 0;
  private consecutiveVoiceFrames = 0;

  private readonly silenceDuration = 1400;
  private readonly minimumSpeechDuration = 500;
  private readonly maximumRecordingDuration = 20000;
  private readonly voiceThreshold = 0.018;
  private readonly preRollDuration = 600;
  private readonly targetSampleRate = 16000;

  constructor(options: StudentVoiceListenerOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error(
        'المتصفح لا يدعم الوصول إلى الميكروفون.'
      );
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      this.audioContext = new AudioContext();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.audioSource =
        this.audioContext.createMediaStreamSource(this.stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.2;

      this.audioSource.connect(this.analyser);

      this.scriptProcessor =
        this.audioContext.createScriptProcessor(
          4096,
          1,
          1
        );

      this.silentGain = this.audioContext.createGain();
      this.silentGain.gain.value = 0;

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isActive) {
          return;
        }

        const input = event.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(input);

        if (this.isRecording) {
          this.recordingChunks.push(chunk);
          this.recordingSampleCount += chunk.length;
        } else if (!this.isFinalizing) {
          this.addToPreRoll(chunk);
        }
      };

      this.audioSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.silentGain);
      this.silentGain.connect(this.audioContext.destination);

      this.isActive = true;
      this.monitorMicrophone();
    } catch (error) {
      this.cleanup();

      if (
        error instanceof DOMException &&
        error.name === 'NotAllowedError'
      ) {
        throw new Error(
          'لم تسمح باستخدام الميكروفون. فعّل إذن الميكروفون من إعدادات المتصفح.'
        );
      }

      if (
        error instanceof DOMException &&
        error.name === 'NotFoundError'
      ) {
        throw new Error(
          'لم يتم العثور على ميكروفون متصل بالجهاز.'
        );
      }

      throw new Error(
        'تعذّر تشغيل الميكروفون. تأكد من توصيله ومن استخدام اتصال HTTPS.'
      );
    }
  }

  stop(): void {
    this.isActive = false;
    this.isRecording = false;
    this.isFinalizing = false;

    this.preRollChunks = [];
    this.preRollSampleCount = 0;

    this.recordingChunks = [];
    this.recordingSampleCount = 0;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.cleanup();
  }

  private addToPreRoll(chunk: Float32Array): void {
    if (!this.audioContext) {
      return;
    }

    this.preRollChunks.push(chunk);
    this.preRollSampleCount += chunk.length;

    const maximumSamples = Math.floor(
      this.audioContext.sampleRate *
      (this.preRollDuration / 1000)
    );

    while (
      this.preRollSampleCount > maximumSamples &&
      this.preRollChunks.length > 0
    ) {
      const removedChunk = this.preRollChunks.shift();

      if (removedChunk) {
        this.preRollSampleCount -= removedChunk.length;
      }
    }
  }

  private monitorMicrophone(): void {
    if (!this.analyser || !this.isActive) {
      return;
    }

    const samples = new Float32Array(
      this.analyser.fftSize
    );

    const checkAudio = () => {
      if (!this.isActive || !this.analyser) {
        return;
      }

      this.analyser.getFloatTimeDomainData(samples);

      let sum = 0;

      for (let index = 0; index < samples.length; index++) {
        sum += samples[index] * samples[index];
      }

      const volume = Math.sqrt(sum / samples.length);
      const now = Date.now();

      if (volume >= this.voiceThreshold) {
        this.consecutiveVoiceFrames++;
        this.lastVoiceAt = now;

        if (
          !this.isRecording &&
          !this.isFinalizing &&
          this.consecutiveVoiceFrames >= 2
        ) {
          this.beginRecording();
        }
      } else {
        this.consecutiveVoiceFrames = 0;

        if (
          this.isRecording &&
          now - this.lastVoiceAt >= this.silenceDuration
        ) {
          this.finishRecording();
        }
      }

      if (
        this.isRecording &&
        now - this.speechStartedAt >=
          this.maximumRecordingDuration
      ) {
        this.finishRecording();
      }

      this.animationFrameId =
        requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  private beginRecording(): void {
    if (
      !this.isActive ||
      !this.audioContext ||
      this.isRecording ||
      this.isFinalizing
    ) {
      return;
    }

    this.recordingChunks = this.preRollChunks.map(
      (chunk) => new Float32Array(chunk)
    );

    this.recordingSampleCount = this.preRollSampleCount;

    this.preRollChunks = [];
    this.preRollSampleCount = 0;

    this.isRecording = true;
    this.speechStartedAt = Date.now();
    this.lastVoiceAt = Date.now();

    this.options.onSpeechStart();
  }

  private finishRecording(): void {
    if (!this.isRecording || !this.audioContext) {
      return;
    }

    this.isRecording = false;
    this.isFinalizing = true;

    const duration = Date.now() - this.speechStartedAt;

    const chunks = this.recordingChunks;

    this.recordingChunks = [];
    this.recordingSampleCount = 0;

    if (duration < this.minimumSpeechDuration) {
      this.isFinalizing = false;
      return;
    }

    try {
      const audioBlob = this.createWavBlob(
        chunks,
        this.audioContext.sampleRate
      );

      if (audioBlob.size < 500) {
        this.isFinalizing = false;
        return;
      }

      // Keep finalizing enabled until transcription finishes.
      void this.transcribeAudio(audioBlob);
    } catch {
      this.isFinalizing = false;

      this.options.onError(
        'تعذّر تجهيز التسجيل الصوتي. حاول مرة أخرى.'
      );
    }
  }

  private createWavBlob(
    chunks: Float32Array[],
    originalSampleRate: number
  ): Blob {
    const totalSamples = chunks.reduce(
      (total, chunk) => total + chunk.length,
      0
    );

    const combinedSamples = new Float32Array(totalSamples);

    let offset = 0;

    for (const chunk of chunks) {
      combinedSamples.set(chunk, offset);
      offset += chunk.length;
    }

    const resampled = this.resampleAudio(
      combinedSamples,
      originalSampleRate,
      this.targetSampleRate
    );

    const bytesPerSample = 2;
    const dataSize = resampled.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.targetSampleRate, true);
    view.setUint32(
      28,
      this.targetSampleRate * bytesPerSample,
      true
    );
    view.setUint16(32, bytesPerSample, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let position = 44;

    for (let index = 0; index < resampled.length; index++) {
      const sample = Math.max(
        -1,
        Math.min(1, resampled[index])
      );

      const value =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7fff;

      view.setInt16(position, value, true);
      position += 2;
    }

    return new Blob([buffer], {
      type: 'audio/wav',
    });
  }

  private resampleAudio(
    samples: Float32Array,
    originalSampleRate: number,
    targetSampleRate: number
  ): Float32Array {
    if (originalSampleRate === targetSampleRate) {
      return samples;
    }

    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.floor(samples.length / ratio);

    const result = new Float32Array(newLength);

    for (let index = 0; index < newLength; index++) {
      const position = index * ratio;
      const firstIndex = Math.floor(position);
      const secondIndex = Math.min(
        firstIndex + 1,
        samples.length - 1
      );

      const fraction = position - firstIndex;

      result[index] =
        samples[firstIndex] * (1 - fraction) +
        samples[secondIndex] * fraction;
    }

    return result;
  }

  private writeString(
    view: DataView,
    offset: number,
    value: string
  ): void {
    for (let index = 0; index < value.length; index++) {
      view.setUint8(
        offset + index,
        value.charCodeAt(index)
      );
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      const audioBase64 = await this.blobToBase64(audioBlob);

      if (!this.isActive) {
        return;
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob.type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          this.options.onError(
            'خدمة استقبال الصوت مشغولة حاليًا. حاول بعد لحظة.'
          );
          return;
        }

        throw new Error(
          result?.error || 'فشل تحويل الصوت إلى نص.'
        );
      }

      if (
        typeof result?.text === 'string' &&
        result.text.trim() &&
        this.isActive
      ) {
        this.options.onTranscript(result.text.trim());
      }
    } catch (error) {
      if (!this.isActive) {
        return;
      }

      this.options.onError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء استقبال صوتك.'
      );
    } finally {
      // Allow a new recording only after the current request is complete.
      this.isFinalizing = false;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;

        if (typeof result !== 'string') {
          reject(new Error('تعذّر قراءة التسجيل الصوتي.'));
          return;
        }

        const base64 = result.split(',')[1];

        if (!base64) {
          reject(new Error('التسجيل الصوتي فارغ.'));
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error('تعذّر تجهيز التسجيل الصوتي.'));
      };

      reader.readAsDataURL(blob);
    });
  }

  private cleanup(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.silentGain) {
      this.silentGain.disconnect();
      this.silentGain = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });

      this.stream = null;
    }

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }
}
