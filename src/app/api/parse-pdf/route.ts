import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text content and metadata
    const parsed = await pdf(buffer);

    return NextResponse.json({
      text: parsed.text.trim(),
      numPages: parsed.numpages,
      info: parsed.info,
      charCount: parsed.text.length,
      estimatedTokens: Math.round(parsed.text.length / 4),
    });
  } catch (error: any) {
    console.error("PDF Parsing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse PDF file" },
      { status: 500 }
    );
  }
}
