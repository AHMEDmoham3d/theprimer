export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const studentName = studentContext?.name || 'طالبنا العزيز';

  if (!apiKey) {
    return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GROQ_API_KEY في ملف .env.`;
  }

  const systemPrompt = `أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري. اسم الطالب: ${studentName}. الصف الدراسي: ${studentContext?.grade || 'الثانوي'}. اشرح بطريقة مبسطة وتفاعلية باللغة العربية.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
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
      console.error("Groq Error:", errData);
    }
  } catch (e) {
    console.error("AI Tutor Error:", e);
  }

  return `يا ${studentName}، بخصوص سؤالك عن ("${prompt}"): دي نقطة ممتازة ومهمة جداً في المنهج! علشان نحلها صح، تعال نبسط الفكرة سوى ونكتب أول خطوة على السبورة. إيه رأيك، إيه أول معطى نقدر نكتبه ونستفيد منه؟`;
}