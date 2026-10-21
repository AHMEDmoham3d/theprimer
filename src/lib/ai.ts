import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
): Promise<string> {
  try {
    if (!apiKey) {
      return `أهلاً بك يا ${
        studentContext?.name || 'طالبنا العزيز'
      }! يرجى ضبط مفتاح VITE_GEMINI_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي.`;
    }

    // استخدام gemini-2.0-flash الموديل النشط حالياً لتجنب خطأ 404 نهائياً
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `
        أنت "The Primer"، أول مدرس شخصي ذكي متاح 24/7 للطالب المصري.
        اسم الطالب: ${studentContext?.name || 'طالب'}
        الصف الدراسي: ${studentContext?.grade || 'الثانوي'}
        نقاط تحتاج تركيز: ${studentContext?.weakTopics?.join('، ') || 'لا توجد'}
        قم بالشرح بطريقة مبسطة، ودودة، وتفاعلية خطوة بخطوة باللغة العربية.
      `,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text || `يا ${studentContext?.name || 'بطل'}، أنا معاك! قول لي إيه أكتر نقطة حابب نوضحها على السبورة؟`;
  } catch (error) {
    console.warn('AI Error caught safely, falling back to local guidance:', error);
    // حماية قصوى: لو حصل أي خطأ في الاتصال أو المفتاح، لن يحدث شاشة سوداء أبداً بل سيرد المدرس محلياً
    return `يا ${studentContext?.name || 'بطل'}، أنا معاك! فكر معايا كده في المسألة دي: إيه أول قانون أو خطوة تحب نكتبها على السبورة عشان نبدأ نحل بيها سوا؟`;
  }
}