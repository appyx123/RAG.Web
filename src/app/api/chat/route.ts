import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, baseURL, apiKey, model, systemPrompt, documentContext } =
      await req.json();

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return new Response(
        JSON.stringify({
          error: "API Key is required. Please set your credentials in the Settings modal.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize OpenAI provider dynamically using the user's BYOK credentials
    const customOpenAI = createOpenAI({
      baseURL: baseURL?.trim() || "https://api.openai.com/v1",
      apiKey: apiKey.trim(),
    });

    // Build the system prompt with stuffed document context
    let fullSystemPrompt =
      systemPrompt ||
      "You are an expert scientific research writing assistant. Provide rigorous, evidence-based answers.";

    if (documentContext && typeof documentContext === "string" && documentContext.trim().length > 0) {
      fullSystemPrompt += `\n\n=== ATTACHED SCIENTIFIC DOCUMENT CONTEXT ===\n${documentContext}\n=== END DOCUMENT CONTEXT ===\n\nImportant Instructions for answering:\n1. Prioritize claims, empirical data, methodology, and citations from the attached document above.\n2. When citing facts from the document, indicate section or context when identifiable.\n3. If a question cannot be answered using the provided document, explicitly state so before supplementing with general academic knowledge.\n4. Format mathematical notations, tables, comparisons, and key takeaways clearly using Markdown.`;
    }

    // Stream the response with Vercel AI SDK
    const result = streamText({
      model: customOpenAI(model || "gpt-4o"),
      system: fullSystemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An unexpected error occurred while communicating with the model provider.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
