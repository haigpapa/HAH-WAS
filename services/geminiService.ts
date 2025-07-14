
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Question, Topic, OnboardingProfile, DailyContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function parseJsonResponse<T,>(response: GenerateContentResponse): T | null {
  try {
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    return null;
  }
}

export const generateQuestionBatch = async (topic: string, userProfile: OnboardingProfile, level: number, startIndex: number, streak: number, theme: string, batchSize: number = 8): Promise<Question[]> => {
  try {
    const prompt = `Generate a batch of ${batchSize} diverse AI hallucination detection questions.
Topic: "${topic}"
Overarching Theme: "${theme}"

User Profile: ${JSON.stringify(userProfile)}
Level: ${level}
Current Streak: ${streak}

CRITICAL INSTRUCTIONS:
1.  **Difficulty Distribution:** The ${batchSize} questions must have this exact difficulty mix:
    - 3 questions must be EASY. The false statement is relatively obvious.
    - 4 questions must be MEDIUM. The false statement requires some thought.
    - Exactly ONE question must be VERY HARD. The false statement should be highly plausible and very difficult to distinguish from the true statements. This is the "boss question".
    The order of these questions in the final JSON output should be randomized.

2.  **Statement Clarity:** For each question, you will generate 4 statements. Every single statement must be a self-contained fact where the subject is clear and explicit. Do not use vague pronouns or assume prior context from other statements. For example, instead of "He then conquered Gaul", write "Julius Caesar then conquered Gaul".

3.  **Content Rules:**
    - Each question must have exactly 4 statements: 3 true, 1 false.
    - The false statement is the "hallucination". It must be plausible but factually incorrect.
    - The position of the false statement within the 4 statements must be randomized for each question.

Generate a JSON object according to the provided schema.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  statements: { type: "ARRAY", items: { type: "STRING" } },
                  correct_answer: { type: "INTEGER" },
                  explanation: { type: "STRING" }
                },
                required: ["statements", "correct_answer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const data = parseJsonResponse<{ questions: Question[] }>(response);
    if (data && data.questions) {
      return data.questions;
    }
    throw new Error("Invalid question data structure from API.");
  } catch (error) {
    console.error('Failed to generate question batch:', error);
    return []; 
  }
};

export const generatePostGameContent = async (topic: string, userProfile: OnboardingProfile, theme: string): Promise<DailyContent | null> => {
    try {
        const prompt = `The user has just completed a challenge on the topic: "${topic}" under the theme "${theme}".
        User Profile: ${JSON.stringify(userProfile)}.
        
        Generate a JSON object with three fields:
        1. keyTakeaway: A single, profound, memorable "piece of wisdom" in Arabic related to the topic. Style: Poetic, concise, modern Arabic.
        2. deeperDiveParagraph: A short, interesting paragraph (2-3 sentences) in Arabic that gives more context about the main topic. It should be engaging and educational for someone waiting for the next day's challenge.
        3. keywords: An array of 3-5 specific Arabic strings that are excellent keywords for further research on this topic.
        
        Example for a topic on Ibn Battuta:
        {
          "keyTakeaway": "السفر لا يتركك صامتاً، بل يجعلك راوياً للقصص.",
          "deeperDiveParagraph": "لم تكن رحلات ابن بطوطة مجرد تنقل جغرافي، بل كانت استكشافاً عميقاً للثقافات والأنظمة الاجتماعية في القرن الرابع عشر. سجلاته، المعروفة باسم 'تحفة النظار'، تقدم نافذة فريدة على عالم كان على وشك التغير.",
          "keywords": ["رحلة ابن بطوطة", "تاريخ المغرب", "تحفة النظار في غرائب الأمصار", "علماء مسلمون"]
        }
        `;
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                keyTakeaway: { type: "STRING" },
                deeperDiveParagraph: { type: "STRING" },
                keywords: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["keyTakeaway", "deeperDiveParagraph", "keywords"]
            }
          }
        });

        const data = parseJsonResponse<Omit<DailyContent, 'topic'>>(response);
        if (data) {
          return { ...data, topic };
        }
        return null;

    } catch (error) {
        console.error('Failed to generate post-game content:', error);
        return {
            topic,
            keyTakeaway: "لكل رحلة نهاية، وفي كل نهاية معرفة جديدة.",
            deeperDiveParagraph: "المعرفة بحر لا ينضب، وكل يوم هو فرصة لتعلم شيء جديد. عد غداً لمغامرة أخرى.",
            keywords: ["تاريخ", "ثقافة", "معرفة"]
        };
    }
};

export const generateHint = async (question: string, topic: string): Promise<string> => {
    try {
        const prompt = `A user in a quiz game about the topic "${topic}" is asking for a hint for the following question.
        Question Statements:
        ${question}
        
        Provide a short, cryptic, one-sentence hint in Arabic that guides the user toward the correct line of thinking without giving away the answer.
        
        Return ONLY the string for the hint.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Failed to generate hint:', error);
        return "أحد الخيارات يختلف عن البقية في جوهره."; // Fallback hint
    }
};

export const generateTopicWisdom = async (topic: string): Promise<string> => {
    try {
        const prompt = `For the Arabic cultural topic "${topic}", provide a single, short, interesting fact or a profound proverb related to it.
        The output should be in Arabic. It will be displayed on a loading screen.
        
        Return ONLY the string for the wisdom/fact.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Failed to generate topic wisdom:', error);
        return "المعرفة بحر، والعلم قارب...";
    }
};

export const generatePersonalizedNote = async (profile: Omit<OnboardingProfile, 'personalizedNote'>): Promise<string> => {
    try {
        const prompt = `Based on this user profile for an AI hallucination detection game, write a short, encouraging, and personalized welcome message in Arabic (one sentence).
        Profile: ${JSON.stringify(profile)}
        
        Example for a beginner interested in culture for entertainment:
        "أهلاً بك! استعد لرحلة مسلية تكشف فيها أغرب الأوهام في عالم الثقافة."
        
        Example for an advanced user interested in science for education with rich detail:
        "مرحباً أيها الخبير! معرفتك العميقة ستكون سلاحك في مواجهة أكثر الأوهام العلمية تعقيداً."
        
        Return ONLY the string for the message.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error('Failed to generate personalized note:', error);
        return "تم إعداد تجربتك لكشف أوهام الذكاء الاصطناعي. استعد."; // Fallback
    }
};

export const generateFactCheckInfo = async (falseStatement: string, topic: string): Promise<{ url: string; title: string } | null> => {
    try {
        const prompt = `Find a reliable source in Arabic that can be used to fact-check the following statement, which is related to the topic of "${topic}": "${falseStatement}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
            for (const chunk of chunks) {
                if (chunk.web && chunk.web.uri) {
                    return {
                        url: chunk.web.uri,
                        title: chunk.web.title || "عرض المصدر"
                    };
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to generate fact-check info:', error);
        return null;
    }
};