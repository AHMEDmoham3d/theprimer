
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_AUDIO_SIZE = 2 * 1024 * 1024;

const SUPPORTED_AUDIO_TYPES: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured');

    return res.status(500).json({
      error: 'Speech recognition service is not configured',
    });
  }

  const { audioBase64, mimeType } = req.body || {};

  if (
    typeof audioBase64 !== 'string' ||
    !audioBase64.trim() ||
    typeof mimeType !== 'string'
  ) {
    return res.status(400).json({
      error: 'Audio data and MIME type are required',
    });
  }

  const normalizedMimeType = mimeType
    .split(';')[0]
    .trim()
    .toLowerCase();

  const extension = SUPPORTED_AUDIO_TYPES[normalizedMimeType];

  if (!extension) {
    return res.status(400).json({
      error: 'Unsupported audio format',
    });
  }

  const cleanBase64 = audioBase64
    .replace(/^data:audio\/[^;]+;base64,/, '')
    .trim();

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
    return res.status(400).json({
      error: 'Invalid audio encoding',
    });
  }

  const estimatedSize = Math.floor(
    (cleanBase64.length * 3) / 4
  );

  if (
    estimatedSize <= 0 ||
    estimatedSize > MAX_AUDIO_SIZE
  ) {
    return res.status(413).json({
      error: 'Audio file is too large',
    });
  }

  try {
    const audioBytes = Buffer.from(cleanBase64, 'base64');

    if (
      audioBytes.length === 0 ||
      audioBytes.length > MAX_AUDIO_SIZE
    ) {
      return res.status(413).json({
        error: 'Invalid audio size',
      });
    }

    const audioBlob = new Blob(
      [
        audioBytes.buffer.slice(
          audioBytes.byteOffset,
          audioBytes.byteOffset + audioBytes.byteLength
        ) as ArrayBuffer,
      ],
      {
        type: normalizedMimeType,
      }
    );

    const formData = new FormData();

    formData.append(
      'file',
      audioBlob,
      `student-audio.${extension}`
    );

    formData.append(
      'model',
      'whisper-large-v3-turbo'
    );

    formData.append('language', 'ar');
    formData.append('response_format', 'json');
    formData.append('temperature', '0');

    formData.append(
      'prompt',
      'محادثة تعليمية بين طالب ومدرس مصري. الكلام باللهجة المصرية العامية. حافظ على الكلمات العربية والمصطلحات العلمية والرياضية كما نطقها المتحدث.'
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.error(
        'Groq transcription error:',
        response.status,
        errorData
      );

      return res.status(
        response.status === 429 ? 429 : 502
      ).json({
        error:
          response.status === 429
            ? 'Speech recognition is temporarily busy'
            : 'Could not transcribe audio',
      });
    }

    const result = await response.json();

    const transcript =
      typeof result?.text === 'string'
        ? result.text.trim()
        : '';

    if (!transcript) {
      return res.status(200).json({
        text: '',
        hasSpeech: false,
      });
    }

    return res.status(200).json({
      text: transcript,
      hasSpeech: true,
    });
  } catch (error) {
    console.error('Transcription backend error:', error);

    return res.status(502).json({
      error: 'Unable to connect to the speech recognition service',
    });
  }
}
