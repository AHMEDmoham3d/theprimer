import { GoogleGenerativeAI } from '@google/generative-ai';

// تهيئة مفتاح الـ API الخاص بـ Gemini (يتم وضعه في متغيرات البيئة VITE_GEMINI_API_KEY)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askAITutor(prompt: string, studentContext?: { name: string; grade: string; weakTopics: string[] }) {
  try {
    if (!apiKey) {
      // رد احتياطي في حال لم يتم ضبط المفتاح بعد
      return `أهلاً بك يا ${studentContext?.name || 'طالبنا العزيز'}! لقد تلقيت سؤالك: "${prompt}". جاري ربط الذكاء الاصطناعي الفعلي بالسيستم...`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemInstruction = `
      أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري.
      اسم الطالب: ${studentContext?.name || 'طالب'}
      الصف الدراسي: ${studentContext?.grade || 'الثانوي'}
      نقاط تحتاج تركيز: ${studentContext?.weakTopics?.join('، ') || 'لا توجد'}
      قم بالشرح بطريقة مبسطة، ودودة، وتفاعلية خطوة بخطوة.
    `;

    const result = await model.generateContent([systemInstruction, prompt]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Error:', error);
    عذراً، حدث خطأ بسيط أثناء الاتصال بالمدرس الذكي. حاول مرة أخرى!
  }
}