
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, JurisdictionContext } from "./types";

const MODEL_NAME = 'gemini-3.1-pro-preview';
const FLASH_MODEL_NAME = 'gemini-3.5-flash';

/**
 * Standard legal research chat interaction with precision filtering
 */
export const askLegalAssistant = async (
  prompt: string, 
  context: JurisdictionContext,
  history: ChatMessage[] = []
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let filterContext = "";
    if (context.filters) {
      const { docType, minYear, maxYear, keywords } = context.filters;
      if (docType && docType !== 'Any') filterContext += `Focus specifically on ${docType} documents. `;
      if (minYear || maxYear) filterContext += `Restrict search to the period between ${minYear || 'earliest records'} and ${maxYear || 'present'}. `;
      if (keywords) filterContext += `Prioritize findings related to keywords: "${keywords}". `;
    }

    let jurisdictionFocus = context.specificJurisdiction 
      ? `${context.level} level research for ${context.specificJurisdiction}`
      : `General ${context.level} level research`;

    if (context.level === 'Comparison' && context.comparisonJurisdiction) {
      jurisdictionFocus = `COMPARATIVE ANALYSIS: Comparing laws in ${context.specificJurisdiction} vs ${context.comparisonJurisdiction}`;
    }

    const targetLanguage = context.language || 'English';

    // Anti-redundancy logic integration
    const precisionRule = context.strictRelevance 
      ? `STRICT RELEVANCE PROTOCOL: 
         1. DEDUPLICATION: Do not suggest any improvements, tips, or legal paths that have been already discussed in the chat history or are visibly implemented in the current context.
         2. NOVELTY: Prioritize only high-impact, non-obvious legal insights. 
         3. SILENCE REDUNDANCY: If no new relevant tips exist, do not provide any. Only stream essential research data.`
      : "Provide helpful general tips for legal research optimization.";

    const systemInstruction = `
      You are LegalAI Global, an elite AI legal assistant specialized in multi-jurisdictional research.
      
      CONTEXT: ${jurisdictionFocus}.
      FILTERS APPLIED: ${filterContext || 'None'}.
      RESPONSE LANGUAGE: ${targetLanguage}.
      
      ${precisionRule}
      
      OPERATIONAL PARAMETERS:
      1. USE GOOGLE SEARCH: Always use search grounding to verify the current status of statutes, recent case law rulings, and treaty ratifications.
      2. PRECISION: Provide specific citations using the appropriate Bluebook or jurisdictional format.
      3. STYLE: Maintain a formal, analytical tone. Use Markdown headers and tables for comparative data.
      
      GROUNDING:
      - Extract all useful links from search results.
      - Never hallucinate legal citations.
      
      DISCLAIMER (Translate to ${targetLanguage}): "I am an AI assistant for research purposes. This is not legal advice. Consult with a qualified legal professional for binding guidance."
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

    const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    const text = response.text || "I apologize, but I encountered an error retrieving that legal information.";
    
    const sourceMap = new Map<string, { title: string; uri: string }>();
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((c: any) => {
      if (c.web && c.web.uri) {
        sourceMap.set(c.web.uri, {
          title: c.web.title || 'Legal Reference Source',
          uri: c.web.uri
        });
      }
    });

    return { text, sources: Array.from(sourceMap.values()) };
  } catch (error) {
    console.error("LegalAI Intelligence Engine Error:", error);
    throw error;
  }
};

/**
 * Specialized legal translation function
 */
export const translateLegalText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You must translate the following legal text from ${sourceLang} to ${targetLang}.
    
    CRITICAL INSTRUCTIONS FOR FORMATTING AND STRUCTURE:
    1. STRICTLY PRESERVE AND REPRODUCE the exact layout, structure, indentation, paragraphing, numbering, bullet points, headings, table formats, and line breaks of the original text.
    2. Do NOT consolidate paragraphs, do NOT split paragraphs, and do NOT alter the line-break patterns. Every single block of text or legal clause must remain in the exact same position relative to others as in the original document.
    3. Ensure precise legal terminology is maintained for the target language and jurisdiction.
    4. Do not include any translation notes, introductory text, or concluding conversational padding. Only output the exact translated text in the original document's structure and format.
    
    ORIGINAL DOCUMENT TEXT TO TRANSLATE:
    ---
    ${text}
    ---`;

    const response = await ai.models.generateContent({
      model: FLASH_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert legal translator fluent in international law systems. Translate accurately while preserving precise legal terminology, statutory weight, and the exact formatting, structural layout, paragraphs, headings, lists, numbering, line breaks, and spacing of the original document. Do not add any conversational introductory or concluding text."
      }
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};

/**
 * Consultative legal advisor functionality
 */
export const getLegalAdvice = async (
  question: string,
  jurisdiction: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a legal consultant for the jurisdiction: ${jurisdiction}. 
    
    INQUIRY:
    ${question}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "Senior legal advisor. Provide structured preliminary guidance. Include mandatory AI disclaimer.",
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "Consultation failed.";
  } catch (error) {
    console.error("Advisor Error:", error);
    throw error;
  }
};

/**
 * Summarizes selected legal content (document or session history)
 */
export const summarizeLegalContent = async (
  content: string,
  type: 'document' | 'session',
  context: JurisdictionContext
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetLanguage = context.language || 'English';
    
    const prompt = type === 'session' 
      ? `Summarize the legal research session. Skip any improvements or points already explicitly resolved in this transcript. Focus only on outstanding legal items.
         
         SESSION TRANSCRIPT:
         ${content}`
      : `Provide a concise legal summary of the following document.
         
         DOCUMENT CONTENT:
         ${content}`;

    const response = await ai.models.generateContent({
      model: FLASH_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: `Executive level legal analyst. Focus on relevance. Language: ${targetLanguage}.`,
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("Summarization Error:", error);
    throw error;
  }
};

export const analyzeEvidenceForTags = async (
  fileName: string,
  base64Data: string,
  mimeType: string
): Promise<{ type: 'document' | 'statement' | 'image' | 'financial', tags: string[], summary: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze this uploaded file named "${fileName}". Based on its content:
1. Classify its primary type into exactly ONE of these categories: 'document', 'statement', 'image', 'financial'.
2. Provide a short 1-sentence summary of the content (max 150 characters).
3. Suggest 2 to 4 highly relevant short legal tags (e.g., 'Evidence', 'Affidavit', 'Discovery', 'Invoice').

Output as pure JSON strictly matching this structure:
{
  "type": "document" | "statement" | "image" | "financial",
  "summary": "...",
  "tags": ["..."]
}`;

    const response = await ai.models.generateContent({
      model: FLASH_MODEL_NAME,
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        systemInstruction: "You are an expert legal evidence analyst. Output strictly valid JSON without markdown wrapping."
      }
    });

    const output = response.text?.trim() || "{}";
    const cleaned = output.replace(/^```json/g, '').replace(/```$/g, '').trim();
    const data = JSON.parse(cleaned);

    return {
      type: data.type || 'document',
      summary: data.summary || 'Summary not available.',
      tags: data.tags || ['Evidence']
    };
  } catch (error) {
    console.error("Evidence Tagging Error:", error);
    return {
      type: 'document',
      summary: `Failed to analyze ${fileName}`,
      tags: ['Uncategorized']
    };
  }
};

export const analyzeEvidenceFile = async (
  file: File,
  context: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const buffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const prompt = `Analyze this piece of visual evidence. Extract any text (OCR) and provide a legal documentation analysis based on the context: ${context}. Include full OCR transcription.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        }
      ],
      config: {
        systemInstruction: "You are an expert legal evidence analyst. Extract text and provide objective analysis."
      }
    });

    return response.text || "Evidence analysis failed.";
  } catch (error) {
    console.error("Evidence Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates an initial draft of a legal document based on user prompt
 */
export const draftLegalDocument = async (
  directive: string,
  jurisdiction: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Draft a comprehensive, professional legal document based on the following instruction.
    
    JURISDICTION: ${jurisdiction}
    INSTRUCTION: ${directive}
    
    Ensure appropriate formatting, standard legal clauses where applicable, and placeholders [LIKE THIS] for missing specific details. Output only the content of the document.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert legal drafter. Produce structured, professional legal documents. Do not add markdown code blocks."
      }
    });

    return response.text?.replace(/^```[a-z]*|```$/gm, '').trim() || "";
  } catch (error) {
    console.error("Drafting Error:", error);
    throw error;
  }
};

/**
 * Analyzes a contract text and assigns risk scores to identified clauses.
 */
export const analyzeContractRisk = async (
  contractText: string
): Promise<Array<{ clause: string, riskLevel: 'low' | 'medium' | 'high' | 'critical', riskReason: string }>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze this legal contract and break it down into key clauses or sections. For each, assess its risk to the reviewing party.

CONTRACT TEXT:
${contractText.substring(0, 15000)}

Respond EXACTLY with a JSON array of objects. Each object must have:
"clause": the brief name or exact snippet of the identified clause
"riskLevel": strictly one of "low", "medium", "high", or "critical"
"riskReason": short explanation of the risk

Output only the JSON array without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert contract risk analyst. Provide output strictly in parsable JSON array format."
      }
    });

    const cleanJson = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanJson) return [];
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Risk Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates a cross-border compliance checklist.
 */
export const generateComplianceChecklist = async (
  sourceJurisdiction: string,
  targetJurisdiction: string,
  businessActivity: string
): Promise<Array<{ category: string, items: Array<{ task: string, description: string, reqLevel: 'mandatory' | 'recommended' }> }>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a cross-border compliance checklist for a business expanding or operating internationally.
    SOURCE JURISDICTION: ${sourceJurisdiction}
    TARGET JURISDICTION: ${targetJurisdiction}
    BUSINESS ACTIVITY: ${businessActivity}
    
    Provide your response exactly as a JSON array of category objects. Each object must have:
    "category": string (e.g., "Data Privacy", "Taxation", "Employment Law")
    "items": array of objects with "task" (string), "description" (string), and "reqLevel" (strictly "mandatory" or "recommended").
    
    Output ONLY valid JSON without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert international trade and compliance lawyer. Provide output strictly in parsable JSON array format."
      }
    });

    const cleanJson = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanJson) return [];
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Compliance Checklist Error:", error);
    throw error;
  }
};

/**
 * Simulates a moot court environment where the AI provides a counter-argument and judge's perspective.
 */
export const simulateMootCourtArg = async (
  userArgument: string,
  jurisdiction: string
): Promise<{ counterArgument: string, judgeFeedback: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as both Opposing Counsel and a strict Judge in a Moot Court setting.
    JURISDICTION: ${jurisdiction}
    USER'S ARGUMENT: ${userArgument}
    
    Provide your response as a JSON object with two keys:
    "counterArgument": The opposing counsel's argument against the user's argument.
    "judgeFeedback": A judge's critical feedback on the user's argument, identifying weaknesses and strengths.
    
    Output ONLY valid JSON without markdown formatting.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert moot court opponent and judge. Provide output strictly in parsable JSON format."
      }
    });

    const cleanJson = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!cleanJson) return { counterArgument: "Failed to generate counter-argument.", judgeFeedback: "Failed to generate judge's feedback." };
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Moot Court Error:", error);
    throw error;
  }
};

/**
 * Automates contract redlining based on a specific perspective
 */
export const suggestContractRedlines = async (
  content: string,
  perspective: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review the following legal text and provide automated redlines to make it more favorable to the ${perspective}. 
    Make direct textual modifications to the contract to improve position. Do not include introductory text, just output the modified contract text directly.
    
    CONTRACT TEXT:
    ${content}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert contract negotiator and drafter. Only output the revised contract text. Do not add markdown code blocks."
      }
    });

    return response.text?.replace(/^```[a-z]*|```$/gm, '').trim() || content;
  } catch (error) {
    console.error("Redlining Error:", error);
    throw error;
  }
};

/**
 * High-fidelity OCR and document text extraction tool using Gemini
 */
export const extractTextFromDocument = async (
  fileName: string,
  base64Data: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a high-fidelity document text extractor. Extract all raw text content (including any readable text from OCR of images/documents) from this file named "${fileName}". Keep the original layout and legal structure as closely as possible. Do not summarize, do not translate, and do not add any commentary or conversational padding. Just output the extracted text content.`;

    const response = await ai.models.generateContent({
      model: FLASH_MODEL_NAME,
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        systemInstruction: "You are an expert OCR and document text extraction tool. Only output the exact extracted text from the document. No conversation, no intro, no markdown blocks."
      }
    });

    return response.text?.replace(/^```[a-z]*|```$/gm, '').trim() || "";
  } catch (error) {
    console.error("Text Extraction Error:", error);
    throw error;
  }
};

