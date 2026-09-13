'use server';

import { auth } from '@/auth';

export async function rewriteServiceName(originalName: string, category: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY is not configured in .env' };
    }

    const prompt = `
You are an expert copywriter for a premium SaaS Social Media Marketing (SMM) platform.
Your task is to take a messy service name and rewrite it into a clean, professional, and trustworthy SaaS service name in English.

Rules:
1. Remove all emojis (⚡, ⭐, 🔥, etc).
2. Remove spammy words like "CHEAP", "FAST", "SUPER", "CRAZY".
3. Use proper Title Case.
4. Keep important details in parentheses at the end (e.g., "Max 10K", "Non-Drop", "30 Days Refill").
5. The format should generally be: "[Platform] [Action] - [Quality/Type] (Details)"
   Example: "Instagram Followers - Premium Quality (Max 10K, Non-Drop)"
6. DO NOT output anything except the rewritten service name. No quotes, no markdown.

Original Name: ${originalName}
Category: ${category}
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    const rewrittenName = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rewrittenName) {
      throw new Error('No response from AI');
    }

    return { success: true, data: rewrittenName };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
