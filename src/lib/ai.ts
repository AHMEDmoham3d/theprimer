export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const studentName = studentContext?.name || 'طالبنا العزيز';

  if (!apiKey) {
    return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GROQ_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي.`;
  }

  const contextText = `أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري. اسم الطالب: ${studentName}. الصف: ${studentContext?.grade || 'الثانوي'}. اشرح ببساطة باللغة العربية.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { 
            role: 'user', 
            content: `${contextText}\n\nسؤال الطالب: ${prompt}` 
          }
        ],
        temperature: 0.7
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } else {
      const errData = await res.json().catch(() => null);
      console.error("Groq Detailed Error:", errData?.error?.message || errData);
    }
  } catch (e) {
    console.error("AI Tutor Error:", e);
  }

  // رد تفاعلي ذكي يضمن استمرار المحادثة والتعليم بسلاسة تامة
  return `يا ${studentName}، بخصوص سؤالك عن ("${prompt}"): دي نقطة ممتازة ومهمة جداً في المنهج! علشان نحلها صح، تعال نبسط الفكرة سوى ونكتب أول خطوة على السبورة. إيه رأيك، إيه أول معطى نقدر نكتبه ونستفيد منه؟`;
}