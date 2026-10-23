
export async function askAITutor(
  prompt: string,
  studentContext?: {
    name: string;
    grade: string;
    weakTopics: string[];
  }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const studentName = studentContext?.name || 'طالبنا العزيز';

  if (!apiKey) {
    return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GROQ_API_KEY في ملف .env.`;
  }

  const systemPrompt = `أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري. اسم الطالب: ${studentName}. الصف الدراسي: ${studentContext?.grade || 'الثانوي'}. اشرح بطريقة مبسطة وتفاعلية باللغة العربية.`;

  try {
    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error('Groq API Error:', {
        status: res.status,
        statusText: res.statusText,
        details: data
      });

      return `يا ${studentName}، حصلت مشكلة أثناء الاتصال بالمدرس الذكي. حاول مرة تانية بعد قليل.`;
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (typeof answer === 'string' && answer.trim()) {
      return answer.trim();
    }

    console.error('Groq API returned no answer:', data);

    return `يا ${studentName}، مقدرتش أجهز إجابة دلوقتي. جرّب تبعت سؤالك مرة تانية.`;

  } catch (e) {
    console.error('AI Tutor Error:', e);

    return `يا ${studentName}، حصل خطأ في الاتصال بالمدرس الذكي. اتأكد من اتصال الإنترنت وحاول تاني.`;
  }
}
