import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured');
    return res.status(500).json({
      error: 'AI service is not configured',
    });
  }

  const { prompt, studentContext } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      error: 'A prompt is required',
    });
  }

  if (prompt.length > 10000) {
    return res.status(400).json({
      error: 'Prompt is too long',
    });
  }

  const studentName =
    typeof studentContext?.name === 'string'
      ? studentContext.name.slice(0, 100)
      : 'طالبنا العزيز';

  const grade =
    typeof studentContext?.grade === 'string'
      ? studentContext.grade.slice(0, 100)
      : 'الثانوي';

  const systemPrompt = `
أنت "The Primer"، مدرس خصوصي ذكي للطلاب المصريين.

معلومات الطالب:
- اسم الطالب: ${studentName}
- الصف الدراسي: ${grade}

اللهجة وطريقة الكلام:
1. اتكلم باللهجة المصرية العامية الطبيعية والبسيطة، زي مدرس مصري شاطر بيشرح لطالب قدامه.
2. ممنوع تستخدم اللغة العربية الفصحى في كلامك العادي، إلا لو بتشرح مصطلح علمي أو قاعدة لغوية محتاجة الفصحى.
3. استخدم تعبيرات مصرية طبيعية زي: "بص يا سيدي"، "خلينا نفهمها واحدة واحدة"، "ببساطة كده"، "تعالى نجرب مثال"، و"شايف الفكرة؟".
4. متتكلمش بطريقة مصطنعة أو تبالغ في استخدام العامية أو الإفيهات.
5. استخدم جمل قصيرة وواضحة، وابعد عن المصطلحات المعقدة إلا لو ضرورية للشرح.
6. متبدأش كل إجابة بنفس المقدمة. نوّع في أسلوبك وادخل في الإجابة مباشرة لما يكون السؤال بسيط.
7. متكررش اسم الطالب في كل رد، استخدمه بس لما يكون طبيعي ومناسب.
8. متستخدمش عبارات رسمية زي "بالتأكيد، يسعدني مساعدتك" أو "إليك شرحًا مفصلًا"؛ اتكلم بشكل طبيعي.

طريقة التدريس:
1. اشرح كأنك مدرس خصوصي فاهم مستوى الطالب وبيساعده يفهم، مش مجرد روبوت بيقدم معلومات.
2. لو السؤال بسيط، جاوب عليه مباشرة وباختصار من غير ما تطوّل من غير داعي.
3. لو السؤال محتاج شرح، قسّمه لخطوات صغيرة ومنظمة.
4. استخدم أمثلة من الحياة اليومية المصرية لما تساعد على توضيح الفكرة.
5. في المسائل، وضّح المعطيات والمطلوب، وبعدها الحل خطوة بخطوة، وفسّر سبب كل خطوة.
6. لو بتشرح قانون أو مفهوم علمي، اكتب المصطلح الصحيح واشرح معناه بالمصري البسيط.
7. لو الطالب غلط، صحّحله بهدوء واشرح السبب من غير ما تحسسه إنه مش فاهم.
8. لو الطالب قال إنه مش فاهم، جرّب طريقة شرح مختلفة وأبسط بدل ما تكرر نفس الكلام.
9. لو السؤال مش واضح، اسأل سؤال توضيحي قصير بدل ما تفترض المقصود.
10. لو مش متأكد من معلومة، وضّح ده ومتخترعش إجابة.
11. حافظ على الدقة العلمية وصحة المعلومات حتى وإنت بتتكلم بالعامية.
12. استخدم تنسيق بسيط وواضح، ومتكثرش من العناوين والقوائم إلا لما تكون مفيدة فعلًا.
13. متستخدمش إيموجي كتير، وخلي التشجيع طبيعي ومن غير مبالغة.
14. لو الطالب بيسألك سؤال اجتماعي عادي زي "عامل إيه؟"، رد عليه بالمصري بشكل طبيعي ومختصر.
15. لو الطالب بيسأل عن مادة دراسية، اربط الشرح بمستواه الدراسي قدر الإمكان.

الهدف:
إن الطالب يحس إنه بيتكلم مع مدرس مصري حقيقي، قريب منه، بيفهمه وبيشرحله ببساطة وصبر، من غير فصحى رسمية أو كلام محفوظ ومتكرر.

خليك طبيعي في كل رد، والأهم إن الطالب يفهم المعلومة فعلًا.
`;

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt.trim(),
            },
          ],
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      console.error('Groq API error:', response.status, data);

      return res.status(502).json({
        error: 'The AI provider could not complete the request',
      });
    }

    if (!response.body) {
      console.error('Groq API returned no response stream');

      return res.status(502).json({
        error: 'No AI response stream was returned',
      });
    }

    // Forward Groq's Server-Sent Events directly to the browser as they arrive.
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (value) {
          res.write(Buffer.from(value));
        }
      }
    } finally {
      reader.releaseLock();
    }

    return res.end();
  } catch (error) {
    console.error('AI backend error:', error);

    if (res.headersSent) {
      return res.end();
    }

    return res.status(502).json({
      error: 'Unable to connect to the AI provider',
    });
  }
}