import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { baseURL, apiKey } = await req.json();

    if (!baseURL || !apiKey) {
      return NextResponse.json(
        { error: "Base URL dan API Key diperlukan untuk mendeteksi model." },
        { status: 400 }
      );
    }

    // Normalize URL
    const cleanBaseURL = baseURL.trim().replace(/\/+$/, "");
    const modelsUrl = cleanBaseURL.endsWith("/models")
      ? cleanBaseURL
      : `${cleanBaseURL}/models`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(modelsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
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
        // Fallback to text
      }

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: `Autentikasi Gagal (401): API Key tidak valid untuk endpoint "${cleanBaseURL}". Pastikan Base URL sesuai dengan provider API Key Anda (misal OpenRouter, OpenAI, dsb). Pesan provider: ${parsedMessage}`,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: `Error dari endpoint (${response.status}): ${parsedMessage}`,
        },
        { status: response.status }
      );
    }

    const json = await response.json();

    // Standard OpenAI format: { data: [{ id: "..." }, ...] }
    // Other endpoints may return: { models: [...] } or array directly
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
      models: modelIds,
      count: modelIds.length,
    });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      {
        error:
          error?.name === "AbortError"
            ? "Koneksi timeout saat menghubungi endpoint. Periksa apakah Base URL dapat diakses."
            : error?.message || "Gagal menghubungi layanan endpoint model.",
      },
      { status: 500 }
    );
  }
}
