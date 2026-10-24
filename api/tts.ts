
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Gemini API is not configured',
    });
  }

  const { text } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      error: 'Text is required',
    });
  }

  if (text.length > 8000) {
    return res.status(400).json({
      error: 'Text is too long',
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          model: 'gemini-3.8-flash-tts',
          input: [
            {
              type: 'user_input',
              content: [
                {
                  type: 'text',
                  text: text.trim(),
                  annotations: [
                    {
                      type: 'speech_metadata',
                      style:
                        'A warm, clear, friendly teacher speaking naturally in Egyptian Arabic. Use conversational pacing, natural pauses, and a patient educational tone. Speak the provided text verbatim.',
                    },
                  ],
                },
              ],
            },
          ],
          response_format: {
            type: 'audio',
            mime_type: 'audio/l16',
            sample_rate: 24000,
          },
          generation_config: {
            speech_config: [
              {
                voice: 'Kore',
              },
            ],
          },
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.error(
        'Gemini TTS error:',
        response.status,
        errorData
      );

      return res.status(
        response.status === 429 ? 429 : 502
      ).json({
        error:
          response.status === 429
            ? 'Audio quota exceeded'
            : 'Could not generate audio',
      });
    }

    if (!response.body) {
      return res.status(502).json({
        error: 'Gemini audio stream is unavailable',
      });
    }

    res.status(200);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let pending = '';
    let audioReceived = false;

    function processEvent(block: string) {
      const dataLines = block
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim());

      if (dataLines.length === 0) return;

      const dataText = dataLines.join('\n');

      if (!dataText || dataText === '[DONE]') return;

      try {
        const event = JSON.parse(dataText);
        const delta = event?.delta;

        if (
          delta?.type === 'audio' &&
          typeof delta.data === 'string'
        ) {
          const audioBytes = Buffer.from(delta.data, 'base64');

          if (audioBytes.length > 0) {
            audioReceived = true;
            res.write(audioBytes);
          }
        }

        if (event?.event_type === 'error') {
          console.error('Gemini stream error:', event);
        }
      } catch (error) {
        console.error('Could not parse Gemini stream event:', error);
      }
    }

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      pending += decoder.decode(value, { stream: true });
      pending = pending.replace(/\r\n/g, '\n');

      let separator = pending.indexOf('\n\n');

      while (separator !== -1) {
        const block = pending.slice(0, separator);
        pending = pending.slice(separator + 2);

        processEvent(block);

        separator = pending.indexOf('\n\n');
      }
    }

    pending += decoder.decode();

    if (pending.trim()) {
      processEvent(pending);
    }

    if (!audioReceived) {
      console.error('Gemini stream returned no audio chunks');

      if (!res.headersSent) {
        return res.status(502).json({
          error: 'No audio was returned',
        });
      }
    }

    return res.end();
  } catch (error) {
    console.error('TTS streaming error:', error);

    if (res.headersSent) {
      return res.end();
    }

    return res.status(502).json({
      error: 'Unable to connect to the speech service',
    });
  }
}
