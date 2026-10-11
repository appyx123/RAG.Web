# RAG.Web

A Bring-Your-Own-Key (**BYOK**) scientific research document chat application built with **Next.js 15 (App Router)**, **Vercel AI SDK**, **Tailwind CSS**, and **Context-Stuffed RAG**.

Designed specifically for researchers, academics, and engineers to analyze scientific papers, extract empirical evidence, synthesize methodology, and draft academic reviews without requiring a vector database.

---

## 🌟 Key Features

- 🔑 **Bring Your Own Key (BYOK)**: Connect directly using your own API credentials and custom OpenAI-compatible endpoints (OpenAI, OpenRouter, Groq, local vLLM/Ollama, custom reverse proxies).
- 🔒 **Client-Side Privacy**: API keys and endpoints are stored purely inside your browser's `localStorage` and dispatched per request. Never stored in server environment variables.
- 📄 **Context-Stuffed RAG (No Vector DB Needed)**: Upload `.pdf` papers to extract their full-text content. The entire text is stuffed directly into the model's context window, preserving end-to-end argumentative structure, citations, and tables without chunk fragmentation.
- 🤖 **Multi-Model Support**: Pre-configured presets for GPT-4o, Claude 3.5 Sonnet, DeepSeek V3/R1, and Llama 3.3 70B, with full support for any custom model identifier.
- 📊 **Scientific Analysis Prompts**: Built-in one-click scientific prompt templates (Methodology synthesis, empirical metrics extraction, research limitations, and literature review drafting).
- 📝 **Rich Markdown & LaTeX Rendering**: Beautiful academic message formatting including tables, bulleted lists, code blocks, and blockquotes powered by `react-markdown` and `remark-gfm`.
- ⚡ **Real-Time Token & Page Estimation**: Instant display of extracted paper page counts and approximate context token loads.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **AI Streaming**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` and `@ai-sdk/openai`)
- **PDF Extraction**: [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/appyx123/RAG.Web.git
cd RAG.Web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration & Usage

1. **Configure API Settings**:
   - Click the **Settings** button in the top-right corner.
   - Enter your **Custom API Base URL** (e.g. `https://api.openai.com/v1` or `https://openrouter.ai/api/v1`).
   - Paste your **API Key** (e.g. `sk-...`).
   - Choose or write your desired **Target Model** (e.g. `gpt-4o`, `anthropic/claude-3.5-sonnet`, `deepseek-chat`).
   - Click **Save Configuration**.

2. **Upload Research Paper**:
   - In the left sidebar, click **Upload Research Paper** and select any `.pdf` file.
   - Wait a moment for text extraction and token estimation to complete.

3. **Inquire & Synthesize**:
   - Ask specific questions about the paper or use the quick research prompt buttons to synthesize methodology, limitations, or findings.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
