import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function askAITutor(
  prompt: string,
  studentContext?: { name: string; grade: string; weakTopics: string[] }
) {
  try {
    if (!apiKey) {
      return `أهلاً بك يا ${
        studentContext?.name || 'طالبنا العزيز'
      }! يرجى ضبط مفتاح VITE_GEMINI_API_KEY في ملف .env لتفعيل الذكاء الاصطناعي.`;
    }

    // إعداد النموذج مع تمرير تعليمات النظام (System Instruction) بشكل صحيح
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
    return response.text();
  } catch (error) {
    console.error('AI Error:', error);
    return 'عذراً، حدث خطأ بسيط أثناء الاتصال بالمدرس الذكي. حاول مرة أخرى!';
  }
}