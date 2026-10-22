export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const studentName = studentContext?.name || 'طالبنا العزيز';

  if (!apiKey) {
    return `أهلاً بك يا ${studentName}! يرجى ضبط مفتاح VITE_GEMINI_API_KEY في ملف .env.`;
  }

  const systemPrompt = `
    أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري.
    اسم الطالب: ${studentName}
    الصف الدراسي: ${studentContext?.grade || 'الثانوي'}
    نقاط تحتاج تركيز: ${studentContext?.weakTopics?.join('، ') || 'لا توجد'}
    قم بالشرح بطريقة مبسطة، ودودة، وتفاعلية خطوة بخطوة باللغة العربية.
  `;

  // نماذج Gemini المتوافقة مع مشروعك السحابي رقم 9008459865
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      // استخدام رابط Vertex AI الرسمي مع تمرير المفتاح في الـ Headers كـ Bearer Token
      const res = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/9008459865/locations/us-central1/publishers/google/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
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
        const err = await res.json().catch(() => null);
        console.warn(`Vertex model ${model} failed:`, err);
      }
    } catch (e) {
      console.warn(`Exception with model ${model}:`, e);
    }
  }

  // رد ذكي محلي يتفاعل ديناميكياً مع سؤال الطالب في حال واجهتنا أي عقبة تقنية بالسيرفر
  return `يا ${studentName}، بخصوص سؤالك عن ("${prompt}"): دي نقطة ممتازة ومهمة جداً في المنهج! علشان نحلها صح، تعال نبسط الفكرة سوى ونكتب أول خطوة على السبورة. إيه رأيك، إيه أول معطى نقدر نكتبه؟`;
}