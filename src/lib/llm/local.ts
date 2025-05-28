/**
 * OpenRouter LLM-Adapter für NextChat
 * Verwendet OpenRouter API für KI-Inferenz
 */
import { LLMOptions, LLMProvider, LLMResponse } from './types';

const OPENROUTER_API_KEY = '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';
const DEFAULT_MODEL = 'mistralai/devstral-small:free';

interface OpenRouterMessage {
  role: 'user' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const localLLM: LLMProvider = {
  /**
   * Generiert Text mit einem LLM-Modell über OpenRouter API
   * 
   * @param prompt Der Eingabetext
   * @param options Optionale Parameter für die Generierung
   * @returns Der generierte Text als Antwort
   */
  async generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    try {
      const openRouterEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const model = options?.model || DEFAULT_MODEL; // Allow model override via options if needed in future
      
      console.log(`[OpenRouterLLM] Verwende Modell: ${model}`);
      
      const messagesArray: OpenRouterMessage[] = [];
      if (options?.systemPrompt) {
        messagesArray.push({ role: 'system', content: options.systemPrompt });
      }
      messagesArray.push({ role: 'user', content: prompt });
      
      const requestBody: any = {
        model,
        messages: messagesArray,
      };
      
      // Optionale Parameter hinzufügen
      if (options?.temperature) {
        requestBody.temperature = options.temperature;
      }
      
      if (options?.maxTokens) {
        requestBody.max_tokens = options.maxTokens;
      }
      
      console.log(`[OpenRouterLLM] Sende Anfrage an OpenRouter: ${openRouterEndpoint}`);
      
      const response = await fetch(openRouterEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[OpenRouterLLM] Fehler bei OpenRouter-Anfrage: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`OpenRouter-Fehler: ${response.status} ${response.statusText} - ${errorBody}`);
      }
      
      const data = await response.json() as OpenRouterResponse;
      
      return {
        text: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('[OpenRouterLLM] Fehler bei der Textgenerierung:', error);
      throw error;
    }
  }
};
