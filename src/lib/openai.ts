import OpenAI from 'openai';

// Lazy initialization - OpenAI client będzie utworzony tylko w runtime, nie podczas buildu
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
      dangerouslyAllowBrowser: false,
    });
  }
  return openaiInstance;
}

// Export getter function instead of instance
export const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAIClient();
    const value = client[prop as keyof OpenAI];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
