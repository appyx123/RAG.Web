import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { baseURL, apiKey } = await req.json();

    if (!baseURL || !apiKey) {
      return NextResponse.json(
        { error: "Base URL and API Key are required to fetch models" },
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
      return NextResponse.json(
        { error: `Endpoint error (${response.status}): ${errorText.slice(0, 300)}` },
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
            ? "Request timeout connecting to endpoint"
            : error?.message || "Failed to connect to endpoint models service",
      },
      { status: 500 }
    );
  }
}
