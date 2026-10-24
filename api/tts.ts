
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
                        'A warm, clear, friendly male teacher speaking naturally in Egyptian Arabic. Use conversational pacing, natural pauses, and a patient educational tone. Speak the provided text verbatim.',
                    },
                  ],
                },
              ],
            },
          ],
          response_format: {
            type: 'audio',
          },
          generation_config: {
            speech_config: [
              {
                voice: 'Charon',
              },
            ],
          },
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(
        'Gemini TTS error:',
        response.status,
        data
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

    const audioData =
      data?.output_audio?.data ||
      data?.steps
        ?.filter((step: any) => step.type === 'model_output')
        ?.flatMap((step: any) => step.content || [])
        ?.filter((item: any) => item.type === 'audio')
        ?.at(-1)?.data;

    if (typeof audioData !== 'string' || !audioData) {
      console.error('Gemini returned no audio data');

      return res.status(502).json({
        error: 'No audio was returned',
      });
    }

    return res.status(200).json({
      audio: audioData,
      mimeType: 'audio/wav',
    });
  } catch (error) {
    console.error('TTS backend error:', error);

    return res.status(502).json({
      error: 'Unable to connect to the speech service',
    });
  }
}
