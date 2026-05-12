import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface UserAnswers {
  country: string;
  city: string;
  industry: string;
  stage: string;
  residency: string;
  fundingNeed: string;
  priorFunding: string;
  preferredType: string;
}

export async function generateFundingGuide(answers: UserAnswers): Promise<string> {
  const prompt = `
You are a world-class business funding and financial resources advisor.
Generate a comprehensive and personalized Business Funding & Financial Resource Guide based on the following user profile:

- Country: ${answers.country}
- City/Region: ${answers.city}
- Industry/Type of Business: ${answers.industry}
- Business Stage: ${answers.stage}
- Residency Status: ${answers.residency}
- Estimated Funding Need: ${answers.fundingNeed}
- Prior Funding: ${answers.priorFunding}
- Preferred Funding Type: ${answers.preferredType}

The guide MUST include these sections:
1. 💰 GRANTS & GOVERNMENT PROGRAMS
2. 🏦 LOANS & CREDIT OPTIONS
3. 🌍 INTERNATIONAL & DEVELOPMENT FUNDING
4. 📈 INVESTORS & VENTURE CAPITAL
5. 🤝 CROWDFUNDING & ALTERNATIVE FINANCING
6. 🧾 FINANCIAL PLANNING & READINESS
7. ⚠️ SPECIAL CONSIDERATIONS (including restrictions for foreign nationals if applicable)

For every section, tailor the advice to the specific country, city, and industry mentioned. Reference official government websites (e.g., SBA in US, BDC in Canada) and reputable sources. Provide actionable steps and eligibility criteria.

At the end of the guide, always say: "Would you like me to go deeper on any specific funding source, help you compare your options, or build a step-by-step funding action plan for your business?"

Tone: Professional, warm, clear, and encouraging.
Format: Use high-quality Markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't generate the guide at this moment. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating guide. Please check your connection and API key.";
  }
}

export async function generateFollowUp(type: 'plan' | 'dive', context: UserAnswers, specificTopic?: string): Promise<string> {
  const baseContext = `Based on: ${context.country}, ${context.industry}, ${context.stage}, needing ${context.fundingNeed}.`;
  
  const prompt = type === 'plan' 
    ? `Generate a 6-month Step-by-Step Funding Action Plan for this business. ${baseContext} Include a month-by-month timeline of preparation, search, application, and closing phases. Tone: Expert, actionable.`
    : `Perform a Deep Dive Research on "${specificTopic}" for this business. ${baseContext} Include specific application requirements, typical eligibility nuances for ${context.country}, and how to stand out. Tone: In-depth, analytical.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Could not generate follow-up.";
  } catch (error) {
    return "Error generating follow-up.";
  }
}
