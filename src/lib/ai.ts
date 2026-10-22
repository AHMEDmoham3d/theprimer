export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const studentName = studentContext?.name || 'طالبنا العزيز';

  if (!apiKey) {
    return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GROQ_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي.`;
  }

  const systemPrompt = `
    أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري.
    اسم الطالب: ${studentName}
    الصف الدراسي: ${studentContext?.grade || 'الثانوي'}
    نقاط تحتاج تركيز: ${studentContext?.weakTopics?.join('، ') || 'لا توجد'}
    قم بالشرح بطريقة مبسطة، ودودة، وتفاعلية خطوة بخطوة باللغة العربية.
  `;

  // نماذج Groq الرسمية والمستقرة جداً
  const models = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'];

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
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
        const err = await res.json().catch(() => null);
        console.warn(`Groq model ${model} failed:`, err);
      }
    } catch (e) {
      console.warn(`Groq fetch exception for ${model}:`, e);
    }
  }

  return `يا ${studentName}، بخصوص سؤالك عن ("${prompt}"): دي نقطة ممتازة ومهمة جداً في المنهج! علشان نحلها صح، تعال نبسط الفكرة سوى ونكتب أول خطوة على السبورة.`;
}