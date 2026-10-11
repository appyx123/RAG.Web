export interface AppSettings {
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  baseURL: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o",
  systemPrompt:
    "You are an expert scientific research writing assistant. Analyze papers accurately, extract empirical evidence, cite document context rigorously, and synthesize findings with academic clarity.",
};

export const POPULAR_MODELS = [
  { label: "GPT-4o (OpenAI)", value: "gpt-4o" },
  { label: "GPT-4o Mini (OpenAI)", value: "gpt-4o-mini" },
  { label: "Claude 3.5 Sonnet (Proxy/OpenRouter)", value: "anthropic/claude-3.5-sonnet" },
  { label: "Claude 3.5 Haiku (Proxy/OpenRouter)", value: "anthropic/claude-3.5-haiku" },
  { label: "DeepSeek V3 (DeepSeek/Proxy)", value: "deepseek-chat" },
  { label: "DeepSeek R1 (DeepSeek/Proxy)", value: "deepseek-reasoner" },
  { label: "Llama 3.3 70B (Groq/OpenRouter)", value: "meta-llama/llama-3.3-70b-instruct" },
];
