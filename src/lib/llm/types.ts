/**
 * Gemeinsame Typdefinitionen für LLM-Adapter
 */

export interface LLMResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMOptions {
  temperature?: number;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export interface LLMProvider {
  generateText: (prompt: string, options?: LLMOptions) => Promise<LLMResponse>;
}
