export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const studentName = studentContext?.name || 'طالبنا العزيز';

    if (!apiKey) {
      return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GEMINI_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي.`;
    }

    const systemPrompt = `
      أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري.
      اسم الطالب: ${studentName}
      الصف الدراسي: ${studentContext?.grade || 'الثانوي'}
      نقاط تحتاج تركيز: ${studentContext?.weakTopics?.join('، ') || 'لا توجد'}
      قم بالشرح بطريقة مبسطة، ودودة، وتفاعلية خطوة بخطوة باللغة العربية.
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nسؤال الطالب: ${prompt}` }]
          }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text || `يا ${studentName}، أنا معاك! قول لي إيه أكتر نقطة حابب نوضحها على السبورة؟`;
  } catch (error) {
    console.warn('AI fetch error caught safely:', error);
    return `يا ${studentContext?.name || 'بطل'}، أنا معاك! فكر معايا كده في المسألة دي: إيه أول قانون أو خطوة تحب نكتبها على السبورة عشان نبدأ نحل بيها سوا؟`;
  }
}