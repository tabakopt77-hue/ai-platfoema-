import { GoogleGenAI } from "@google/genai";
import { KnowledgeItem } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateDevOpsAdvice = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[],
  knowledgeBase: KnowledgeItem[]
): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {
  try {
    // 1. Prepare Context from "Memory"
    const contextString = knowledgeBase.map(k => `[${k.category.toUpperCase()}]: ${k.content}`).join('\n');

    // 2. Configure Model with Search
    const modelId = 'gemini-3-pro-preview'; // Using Pro for better reasoning and search

    // Note: In a real app, we would create a chat session, but for this stateless wrapper
    // we are re-creating the config per request to inject fresh knowledgeBase context.
    const chat = ai.chats.create({
      model: modelId,
      config: {
        tools: [{ googleSearch: {} }], // Enable Internet Access
        systemInstruction: `Ты — NexusOps, автономный ИИ-архитектор и DevOps-инженер.
        
        ТВОЯ ПАМЯТЬ И КОНТЕКСТ ПРОЕКТА:
        ${contextString}
        
        ТВОИ ВОЗМОЖНОСТИ:
        1. ИСПОЛЬЗУЙ ПОИСК (Google Search) для нахождения актуальных версий библиотек, решения свежих багов и чтения документации.
        2. ГЕНЕРИРУЙ ПОЛНЫЕ СКРИПТЫ. Если просят задеплоить — пиши полный Bash/Python скрипт, который делает git clone, docker build, и т.д.
        3. ОБУЧЕНИЕ. Учитывай контекст из блока "ТВОЯ ПАМЯТЬ" выше.
        
        ЯЗЫК: РУССКИЙ.
        
        ОГРАНИЧЕНИЯ:
        Ты работаешь в браузере. Ты не можешь сам выполнить 'ssh' или 'git push'. 
        Твоя задача — сгенерировать ИДЕАЛЬНЫЙ код, который пользователь скопирует и запустит в своем терминале, чтобы выполнить задачу.
        `,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: prompt });
    
    // Extract grounding (search sources)
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter(Boolean) || [];

    return { 
      text: result.text || "Ошибка генерации ответа.",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Ошибка подключения к ИИ. Проверьте API Key." };
  }
};