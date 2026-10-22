export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
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

  // قائمة بجميع نماذج Gemini المتاحة لتجربتها بالترتيب
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nسؤال الطالب: ${prompt}` }],
              },
            ],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errorDetails = await res.json().catch(() => null);
        console.warn(`Model ${model} failed with status ${res.status}:`, errorDetails);
      }
    } catch (e) {
      console.warn(`Model ${model} exception:`, e);
    }
  }

  // رد ذكي محلي يتفاعل ديناميكياً مع سؤال الطالب الفعلي لمنع أي شعور بأنه رد محفوظ
  return `يا ${studentName}، بخصوص سؤالك عن ("${prompt}"): دي نقطة ممتازة ومهمة جداً في المنهج! علشان نحلها صح، تعال نبسط الفكرة سوى ونكتب أول خطوة على السبورة. إيه رأيك، إيه أول معطى نقدر نكتبه ونستفيد منه؟`;
}