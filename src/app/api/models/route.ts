import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { baseURL, apiKey } = await req.json();

    if (!baseURL || !apiKey) {
      return NextResponse.json({
        success: false,
        error: "Base URL dan API Key diperlukan untuk mendeteksi model.",
      });
    }

    const trimmedKey = apiKey.trim();
    const cleanBaseURL = baseURL.trim().replace(/\/+$/, "");
    const modelsUrl = cleanBaseURL.endsWith("/models")
      ? cleanBaseURL
      : `${cleanBaseURL}/models`;

    // Smart provider hint
    let providerHint = "";
    if (trimmedKey.startsWith("sk-or-") && !cleanBaseURL.includes("openrouter")) {
      providerHint =
        " (Petunjuk: Key ini berformat OpenRouter 'sk-or-'. Coba ubah Base URL ke: https://openrouter.ai/api/v1)";
    } else if (trimmedKey.startsWith("gsk_") && !cleanBaseURL.includes("groq")) {
      providerHint =
        " (Petunjuk: Key ini berformat Groq 'gsk_'. Coba ubah Base URL ke: https://api.groq.com/openai/v1)";
    } else if (trimmedKey.startsWith("sk-ant-")) {
      providerHint =
        " (Petunjuk: Key ini adalah format Anthropic direct. Pastikan Base URL adalah proxy yang mendukung endpoint /models).";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(modelsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        parsedMessage =
          errorJson?.error?.message ||
          errorJson?.message ||
          errorJson?.error ||
          errorText;
      } catch {
        // Fallback text
      }

      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          error: `Autentikasi Gagal (401): API Key tidak valid untuk endpoint "${cleanBaseURL}". Pastikan Base URL sesuai dengan provider API Key Anda.${providerHint} Pesan provider: ${parsedMessage}`,
        });
      }

      return NextResponse.json({
        success: false,
        error: `Error dari endpoint (${response.status}): ${parsedMessage}${providerHint}`,
      });
    }

    const json = await response.json();

    let rawItems: any[] = [];
    if (Array.isArray(json)) {
      rawItems = json;
    } else if (Array.isArray(json.data)) {
      rawItems = json.data;
    } else if (Array.isArray(json.models)) {
      rawItems = json.models;
    }

    const modelIds: string[] = rawItems
      .map((item) => (typeof item === "string" ? item : item?.id || item?.name))
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      models: modelIds,
      count: modelIds.length,
    });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return NextResponse.json({
      success: false,
      error:
        error?.name === "AbortError"
          ? "Koneksi timeout saat menghubungi endpoint. Periksa apakah Base URL dapat diakses."
          : error?.message || "Gagal menghubungi layanan endpoint model.",
    });
  }
}
