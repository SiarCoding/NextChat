/**
 * Lokaler LLM-Adapter für NextChat
 * Verwendet Ollama für DSGVO-konforme KI-Inferenz
 */
import { LLMOptions, LLMProvider, LLMResponse } from './types';

const DEFAULT_MODEL = 'llama3'; // Wir verwenden das bereits installierte Llama3-Modell

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const localLLM: LLMProvider = {
  /**
   * Generiert Text mit einem lokalen LLM-Modell über Ollama
   * 
   * @param prompt Der Eingabetext
   * @param options Optionale Parameter für die Generierung
   * @returns Der generierte Text als Antwort
   */
  async generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    try {
      const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate';
      const model = options?.model || process.env.OLLAMA_MODEL || DEFAULT_MODEL;
      
      console.log(`[LocalLLM] Verwende Modell: ${model}`);
      
      const requestBody: any = {
        model,
        prompt,
        stream: false
      };
      
      // Optionale Parameter hinzufügen
      if (options?.temperature) {
        requestBody.temperature = options.temperature;
      }
      
      if (options?.systemPrompt) {
        requestBody.system = options.systemPrompt;
      }
      
      if (options?.maxTokens) {
        requestBody.max_tokens = options.maxTokens;
      }
      
      console.log(`[LocalLLM] Sende Anfrage an Ollama: ${ollamaEndpoint}`);
      
      const response = await fetch(ollamaEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        console.error(`[LocalLLM] Fehler bei Ollama-Anfrage: ${response.status}`);
        throw new Error(`Ollama-Fehler: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as OllamaResponse;
      
      return {
        text: data.response,
        model: data.model,
        usage: {
          promptTokens: 0, // Ollama gibt keine Token-Nutzung zurück
          completionTokens: 0,
          totalTokens: 0
        }
      };
    } catch (error) {
      console.error('[LocalLLM] Fehler bei der Textgenerierung:', error);
      throw error;
    }
  }
};
