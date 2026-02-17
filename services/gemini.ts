import { GoogleGenAI, SchemaType } from "@google/genai";
import { KnowledgeItem, AgentProfile, LearningResult, ResearchResult } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// 1. Chat Generation
export const generateDevOpsAdvice = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[],
  knowledgeBase: KnowledgeItem[],
  agentProfile: AgentProfile
): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {
  try {
    // Filter out harmful knowledge before sending to context
    const safeKnowledge = knowledgeBase.filter(k => k.type === 'beneficial');
    
    // Group knowledge by cluster for better context
    const clusters: Record<string, string[]> = {};
    safeKnowledge.forEach(k => {
      if (!clusters[k.cluster]) clusters[k.cluster] = [];
      clusters[k.cluster].push(k.content);
    });

    const contextString = Object.entries(clusters)
      .map(([cluster, items]) => `[${cluster.toUpperCase()}]:\n${items.join('; ')}`)
      .join('\n\n');

    const skillsString = agentProfile.skills.map(s => `- ${s.name} (Уровень ${s.level})`).join('\n');

    // --- STRICT ToR RULES INJECTION ---
    let specificDirectives = "";
    
    if (agentProfile.type === 'WATCHDOG') {
      specificDirectives = `
      CRITICAL SECURITY PROTOCOL (WATCHDOG):
      1. YOU DO NOT HAVE INTERNET ACCESS.
      2. YOU DO NOT HAVE SSH ACCESS to external servers.
      3. YOU CANNOT EXECUTE COMMANDS.
      4. YOUR SOLE PURPOSE IS: Detect, Log, Alert, Quarantine.
      5. If asked to connect via SSH or deploy code, REFUSE and state you are the Internal Watchdog.
      6. Focus on logs, config diffs, and vulnerability patterns.
      `;
    } else if (agentProfile.type === 'USER_SIDE') {
      specificDirectives = `
      OPERATIONAL PROTOCOL (USER-SIDE AGENT):
      1. You are authorized to manage USER servers via SSH (Paramiko).
      2. You DO NOT have access to internal moskomp.ru infrastructure.
      3. You can generate deployment scripts and SSH automation code.
      4. Always verify host keys before connecting.
      `;
    }

    const modelId = 'gemini-3-pro-preview'; 

    const chat = ai.chats.create({
      model: modelId,
      config: {
        tools: agentProfile.type === 'USER_SIDE' ? [{ googleSearch: {} }] : [], // Watchdog has no internet
        systemInstruction: `SYSTEM IDENTITY: ${agentProfile.name} (${agentProfile.role}).
        TYPE: ${agentProfile.type}
        
        ${specificDirectives}

        YOUR SKILLS:
        ${skillsString}
        
        INTERNAL KNOWLEDGE BASE:
        ${contextString}
        
        INSTRUCTIONS:
        - Be concise, professional, and deterministic.
        - If generating code, ensure it matches your permissions.
        `,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: prompt });
    
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter(Boolean) || [];

    return { 
      text: result.text || "Ошибка генерации.",
      sources: sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Сбой нейроядра. Проверьте API Key." };
  }
};

// 2. Chat Analysis (Learning from conversation)
export const extractNewKnowledge = async (
  lastConversation: string,
  existingKnowledge: KnowledgeItem[]
): Promise<LearningResult> => {
  try {
    const modelId = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `
      Analyze conversation. Extract facts. Update skills.
      
      DIALOG: ${lastConversation}
      
      Return JSON: { "facts": ["fact1"], "skills": [{"name": "Python Scripting", "xp": 10}] }
      `,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text?.trim();
    if (!text) return { facts: [], skillUpdates: [] };
    
    try {
        const parsed = JSON.parse(text);
        const facts = parsed.facts || [];
        const skillUpdates = (parsed.skills || []).map((s: any) => ({
            skillName: s.name || s.skillName,
            xpGained: s.xp || 10
        }));
        return { facts, skillUpdates };
    } catch (e) {
        return { facts: [], skillUpdates: [] };
    }
  } catch (e) {
    return { facts: [], skillUpdates: [] };
  }
};

// 3. AUTONOMOUS INTERNET RESEARCH ENGINE
export const performAutonomousResearch = async (
  topic: string
): Promise<ResearchResult> => {
  try {
    const modelId = 'gemini-3-flash-preview';

    const prompt = `
    АВТОНОМНОЕ ИССЛЕДОВАНИЕ: "${topic}".
    
    1. Найди в интернете самую свежую и технически точную информацию по этой теме.
    2. Проанализируй информацию на предмет:
       - Полезности (Best Practices, Optimizations)
       - Вреда (Deprecated methods, Security risks, Anti-patterns)
    3. Сгруппируй данные в кластеры (например: Security, Performance, Syntax, Config).
    
    Верни JSON в формате:
    {
      "summary": "Краткий итог исследования (1 предложение)",
      "items": [
        {
          "content": "Текст знания (факта)",
          "cluster": "Название кластера (одно слово)",
          "type": "beneficial" | "harmful" | "neutral",
          "confidence": 80-100
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");

    const parsed = JSON.parse(text);
    const items: KnowledgeItem[] = (parsed.items || []).map((item: any) => ({
      id: Date.now().toString() + Math.random(),
      cluster: item.cluster || 'General',
      content: item.content,
      addedAt: new Date(),
      confidence: item.confidence || 90,
      type: item.type || 'neutral',
      sourceUrl: ''
    }));

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    if (groundingChunks.length > 0 && items.length > 0) {
        const firstWeb = groundingChunks.find((c: any) => c.web);
        if (firstWeb && items[0]) {
            items[0].sourceUrl = firstWeb.web.uri;
        }
    }

    return {
      items,
      summary: parsed.summary || "Исследование завершено.",
      processedCount: items.length
    };

  } catch (e) {
    console.error("Research failed", e);
    return { items: [], summary: "Ошибка исследования.", processedCount: 0 };
  }
};