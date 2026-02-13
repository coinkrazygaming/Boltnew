import OpenAI from "openai";
import { ENV } from "@/config/env";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!ENV.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    openaiClient = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
}

export interface CodeGenerationOptions {
  prompt: string;
  language?: string;
  framework?: string;
  onChunk?: (chunk: string) => void;
}

/**
 * Generate code from a natural language prompt using OpenAI GPT-4
 */
export async function generateCode(options: CodeGenerationOptions): Promise<string> {
  const { prompt, language = "javascript", framework = "React", onChunk } = options;

  const client = getOpenAIClient();

  const systemPrompt = `You are an expert full-stack developer and code generation AI. Your task is to generate clean, production-ready code based on user requests.

Guidelines:
- Generate working, tested code without placeholders or TODOs
- Use best practices and modern patterns
- Include necessary imports and dependencies
- Write TypeScript when possible
- For React/Next.js projects, use functional components with hooks
- Add proper error handling
- Include comments only for complex logic
- Generate only the code, no explanations

Current context:
- Language: ${language}
- Framework: ${framework}
- Format: Complete, runnable code only`;

  let fullResponse = "";

  const stream = await client.messages.create({
    model: "gpt-4",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  for await (const messageStreamEvent of stream) {
    if (
      messageStreamEvent.type === "content_block_delta" &&
      messageStreamEvent.delta.type === "text_delta"
    ) {
      const chunk = messageStreamEvent.delta.text;
      fullResponse += chunk;
      onChunk?.(chunk);
    }
  }

  return fullResponse;
}

/**
 * Generate a complete project structure from a description
 */
export async function generateProjectStructure(
  description: string
): Promise<{ files: Record<string, string>; packageJson: any }> {
  const client = getOpenAIClient();

  const systemPrompt = `You are a full-stack developer tasked with creating a complete project structure. 

Return a JSON object with this structure:
{
  "files": {
    "src/App.tsx": "...",
    "src/index.css": "...",
    "package.json": "{...}"
  },
  "packageJson": {...}
}

Generate all necessary files for a working application. Use React with TypeScript.`;

  const response = await client.messages.create({
    model: "gpt-4",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Create a complete project structure for: ${description}`,
      },
    ],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [
      null,
      content,
    ];
    const jsonStr = jsonMatch[1] || content;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse project structure:", error);
    throw new Error("Failed to generate valid project structure");
  }
}

/**
 * Get code refactoring suggestions
 */
export async function refactorCode(code: string, suggestion: string): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.messages.create({
    model: "gpt-4",
    max_tokens: 4096,
    system:
      "You are a code refactoring expert. Refactor the provided code according to the user's request. Return only the refactored code, no explanations.",
    messages: [
      {
        role: "user",
        content: `Refactor the following code: ${suggestion}\n\nCode:\n${code}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * Generate test cases for code
 */
export async function generateTests(code: string, language: string = "typescript"): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.messages.create({
    model: "gpt-4",
    max_tokens: 4096,
    system: `Generate comprehensive test cases for the provided code. Use ${language} and Jest/Vitest testing framework. Return only the test code.`,
    messages: [
      {
        role: "user",
        content: `Generate tests for:\n${code}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * Explain code to the user
 */
export async function explainCode(code: string): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.messages.create({
    model: "gpt-4",
    max_tokens: 2048,
    system: "You are a helpful code explainer. Explain the provided code in clear, concise terms.",
    messages: [
      {
        role: "user",
        content: `Explain this code:\n${code}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
