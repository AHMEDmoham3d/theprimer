
export async function askAITutor(
  prompt: string,
  studentContext?: {
    name: string;
    grade: string;
    weakTopics: string[];
  }
): Promise<string> {
  const studentName = studentContext?.name || 'طالبنا العزيز';

  try {
    const res = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        studentContext,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error('AI backend error:', res.status, data);

      return `يا ${studentName}، حصلت مشكلة أثناء الاتصال بالمدرس الذكي. حاول مرة تانية بعد قليل.`;
    }

    if (typeof data?.answer === 'string' && data.answer.trim()) {
      return data.answer.trim();
    }

    return `يا ${studentName}، مقدرتش أجهز إجابة دلوقتي. جرّب تبعت سؤالك مرة تانية.`;
  } catch (error) {
    console.error('AI request error:', error);

    return `يا ${studentName}، حصل خطأ في الاتصال بالمدرس الذكي. اتأكد من اتصال الإنترنت وحاول تاني.`;
  }
}
