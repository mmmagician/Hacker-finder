import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const desiredJsonResponseShape = `{
  "safetyLevel": "'SAFE' | 'CAUTION' | 'DANGEROUS'",
  "summary": "خلاصه تحلیل در یک جمله.",
  "details": "جزئیات تحلیل به صورت چند نکته."
}`;

// Helper function to extract JSON from the model's text response
const extractJson = (text: string): any => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
             // Fallback to parsing the whole text if markdown block parsing fails
        }
    }
    // Fallback for when the model returns raw JSON without markdown
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("پاسخ دریافت شده از هوش مصنوعی در قالب JSON معتبر نبود.");
    }
};


export const analyzeUrl = async (url: string): Promise<AnalysisResult> => {
  const prompt = `
    URL زیر را برای تهدیدات امنیتی تحلیل کن: ${url}

    با استفاده از جستجوی گوگل، محتوای لینک و اعتبار دامنه را به دقت بررسی کن.
    
    معیارهای تحلیل:
    1.  **فیشینگ:** آیا وب‌سایت تلاش می‌کند تا با جعل هویت یک سایت معتبر، اطلاعات کاربری را سرقت کند؟
    2.  **بدافزار/نرم‌افزار مخرب:** آیا کاربر را به دانلود نرم‌افزار ناخواسته یا مخرب تشویق می‌کند؟
    3.  **مهندسی اجتماعی:** آیا از ترفندهای فریبنده برای وادار کردن کاربر به انجام کاری خطرناک استفاده می‌کند؟
    4.  **اعتبار دامنه:** آیا دامنه شناخته شده است یا جدید و مشکوک به نظر می‌رسد؟ (مثلاً غلط‌های املایی در نام برندهای معروف).
    5.  **ساختار URL:** آیا پارامترهای مشکوک یا ریدایرکت‌های پنهان وجود دارد؟

    خروجی را **فقط و فقط** به صورت یک رشته JSON ارائه بده که ساختار زیر را داشته باشد. هیچ متنی خارج از بلوک JSON ننویس.
    ساختار JSON مورد نظر:
    ${desiredJsonResponseShape}

    سطح امنیت ('safetyLevel') باید یکی از این سه مقدار باشد: 'SAFE', 'CAUTION', 'DANGEROUS'.
    توضیحات 'summary' و 'details' باید به زبان فارسی باشند.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const jsonResult = extractJson(response.text.trim());

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingSource[] = groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web?.uri && web?.title) || [];
    
    // Validate the parsed object against the expected type
    if (jsonResult && jsonResult.safetyLevel && jsonResult.summary && jsonResult.details) {
      return { ...jsonResult, sources } as AnalysisResult;
    } else {
      throw new Error("پاسخ دریافت شده از هوش مصنوعی ساختار معتبری ندارد.");
    }

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof Error) {
        throw new Error(`خطا در ارتباط با هوش مصنوعی: ${error.message}`);
    }
    throw new Error("در هنگام تجزیه و تحلیل لینک خطایی رخ داد. لطفا دوباره تلاش کنید.");
  }
};
