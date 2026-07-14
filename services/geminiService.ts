
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, JurisdictionContext } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export const askLegalAssistant = async (
  prompt: string, 
  context: JurisdictionContext,
  history: ChatMessage[] = []
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let jurisdictionFocus = "";
    if (context.level === 'Comparison') {
      jurisdictionFocus = `COMPARATIVE ANALYSIS MODE: Comparing laws in ${context.specificJurisdiction} vs ${context.comparisonJurisdiction}. Focus on conflicts, overlaps, and multi-jurisdictional compliance.`;
    } else {
      jurisdictionFocus = context.specificJurisdiction 
        ? `${context.level} level, specifically for ${context.specificJurisdiction}`
        : `${context.level} level`;
    }

    const systemInstruction = `
      You are LegalAI Global, the world's leading multijurisdictional legal intelligence engine.
      
      CORE CAPABILITIES:
      1. Comparative Law: You excel at identifying the differences between legal frameworks in different nations or states.
      2. Regulatory Tracking: You monitor recent changes (via Google Search) to provide current statutory status.
      3. Global Framework Analysis: You understand how international treaties influence local law.
      
      JURISDICTIONAL CONTEXT: ${jurisdictionFocus}.
      RESPONSE LANGUAGE: ${context.language || 'English'}.
      
      MARKDOWN RULES:
      - Use tables for comparative law outputs.
      - Use **bold** for statute names.
      - End every response with the mandatory Legal Research Disclaimer.
      
      MANDATORY: Use Google Search tool for all specific legal citations or recent changes.
    `;

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
      history: history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    });

    const response = await chat.sendMessage({ message: prompt });
    const text = response.text || "No data returned.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sourceMap = new Map<string, { title: string; uri: string }>();
    chunks.forEach((c: any) => {
      if (c.web && c.web.uri) {
        sourceMap.set(c.web.uri, {
          title: c.web.title || 'Legal Reference',
          uri: c.web.uri
        });
      }
    });

    return { text, sources: Array.from(sourceMap.values()) };
  } catch (error) {
    console.error("Gemini Global API Error:", error);
    throw error;
  }
};
