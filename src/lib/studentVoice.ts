
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
  private mediaRecorder: MediaRecorder | null = null;

  private animationFrameId: number | null = null;
  private audioChunks: Blob[] = [];

  private isActive = false;
  private isRecording = false;
  private discardCurrentRecording = false;

  private speechStartedAt = 0;
  private lastVoiceAt = 0;
  private consecutiveVoiceFrames = 0;

  private readonly silenceDuration = 1000;
  private readonly minimumSpeechDuration = 350;
  private readonly maximumRecordingDuration = 20000;
  private readonly voiceThreshold = 0.018;

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

    if (typeof MediaRecorder === 'undefined') {
      throw new Error(
        'تسجيل الصوت غير مدعوم في هذا المتصفح.'
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

      const source = this.audioContext.createMediaStreamSource(
        this.stream
      );

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.2;

      source.connect(this.analyser);

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
    this.discardCurrentRecording = true;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (
      this.mediaRecorder &&
      this.mediaRecorder.state !== 'inactive'
    ) {
      this.mediaRecorder.stop();
    }

    this.cleanup();
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
      !this.stream ||
      this.isRecording
    ) {
      return;
    }

    try {
      const mimeType = this.getSupportedMimeType();

      const recorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder = recorder;
      this.audioChunks = [];
      this.discardCurrentRecording = false;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const chunks = this.audioChunks;
        const recordingType =
          recorder.mimeType || 'audio/webm';

        this.audioChunks = [];

        if (this.mediaRecorder === recorder) {
          this.mediaRecorder = null;
        }

        if (this.discardCurrentRecording) {
          this.discardCurrentRecording = false;
          return;
        }

        const duration = Date.now() - this.speechStartedAt;

        if (duration < this.minimumSpeechDuration) {
          return;
        }

        const audioBlob = new Blob(chunks, {
          type: recordingType,
        });

        if (audioBlob.size < 500) {
          return;
        }

        void this.transcribeAudio(audioBlob);
      };

      recorder.onerror = () => {
        this.options.onError(
          'حدثت مشكلة أثناء تسجيل صوتك. حاول مرة أخرى.'
        );
      };

      recorder.start(250);

      this.isRecording = true;
      this.speechStartedAt = Date.now();
      this.lastVoiceAt = Date.now();

      this.options.onSpeechStart();
    } catch {
      this.isRecording = false;

      this.options.onError(
        'تعذّر بدء تسجيل صوتك.'
      );
    }
  }

  private finishRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) {
      return;
    }

    this.isRecording = false;

    const recorder = this.mediaRecorder;

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      const audioBase64 = await this.blobToBase64(audioBlob);

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

  private getSupportedMimeType(): string {
    const supportedTypes = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/webm',
    ];

    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  private cleanup(): void {
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
