
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured');
    return res.status(500).json({ error: 'AI service is not configured' });
  }

  const { prompt, studentContext } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A prompt is required' });
  }

  if (prompt.length > 10000) {
    return res.status(400).json({ error: 'Prompt is too long' });
  }

  const studentName =
    typeof studentContext?.name === 'string'
      ? studentContext.name.slice(0, 100)
      : 'طالبنا العزيز';

  const grade =
    typeof studentContext?.grade === 'string'
      ? studentContext.grade.slice(0, 100)
      : 'الثانوي';

  const systemPrompt =
    `أنت "The Primer"، مدرس شخصي ذكي للطالب المصري. ` +
    `اسم الطالب: ${studentName}. الصف الدراسي: ${grade}. ` +
    'اشرح بطريقة مبسطة وتفاعلية باللغة العربية.';

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt.trim() },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Groq API error:', response.status, data);

      return res.status(502).json({
        error: 'The AI provider could not complete the request',
      });
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (typeof answer !== 'string' || !answer.trim()) {
      return res.status(502).json({ error: 'No AI answer was returned' });
    }

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error('AI backend error:', error);

    return res.status(502).json({
      error: 'Unable to connect to the AI provider',
    });
  }
}
