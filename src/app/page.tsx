"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSettings } from "@/hooks/use-settings";
import { SettingsModal } from "@/components/SettingsModal";
import {
  FileText,
  Upload,
  Send,
  Settings,
  Trash2,
  AlertCircle,
  Bot,
  User as UserIcon,
  Loader2,
  FileCheck,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  FlaskConical,
  ExternalLink,
} from "lucide-react";

export default function DocumentChatPage() {
  const { settings, saveSettings, isLoaded } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Document state (Context Stuffing)
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docText, setDocText] = useState<string>("");
  const [docStats, setDocStats] = useState<{
    pages: number;
    tokens: number;
    charCount: number;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK useChat
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      baseURL: settings.baseURL,
      apiKey: settings.apiKey,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
      documentContext: docText,
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle PDF upload and extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF document.");
      return;
    }

    setDocFile(file);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract text from PDF");
      }

      const data = await res.json();
      setDocText(data.text);
      setDocStats({
        pages: data.numPages,
        tokens: data.estimatedTokens,
        charCount: data.charCount,
      });
    } catch (err: any) {
      alert(err.message || "Error reading PDF file");
      setDocFile(null);
      setDocText("");
      setDocStats(null);
    } finally {
      setIsParsing(false);
    }
  };

  const removeDocument = () => {
    setDocFile(null);
    setDocText("");
    setDocStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const applyResearchPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 flex-col font-sans select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-zinc-100">
                ScholarChat <span className="text-indigo-400 font-mono text-xs font-normal">BYOK</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Scientific Context
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Model Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span
              className={`w-2 h-2 rounded-full ${
                settings.apiKey ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-500"
              }`}
            />
            <span className="truncate max-w-[140px]">{settings.model}</span>
          </div>

          {/* Reset Conversation */}
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              title="Clear chat"
              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition border border-zinc-700/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              !settings.apiKey
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse"
                : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {!settings.apiKey ? "Set API Key" : "Settings"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Sidebar (Attached Context) */}
        <aside className="w-80 border-r border-zinc-800/80 bg-zinc-900/30 p-4 flex flex-col justify-between hidden md:flex overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Paper Context
              </h2>
              {docStats && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Stuffed RAG
                </span>
              )}
            </div>

            {/* Upload Area */}
            {!docFile ? (
              <label className="border-2 border-dashed border-zinc-700/80 hover:border-indigo-500 hover:bg-indigo-500/5 transition rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isParsing}
                />
                {isParsing ? (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                    <span className="text-xs font-medium text-zinc-300">Extracting PDF text...</span>
                    <span className="text-[11px] text-zinc-500 mt-1">Reading sections & tables</span>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 text-zinc-400 transition mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-zinc-200">Upload Research Paper</span>
                    <span className="text-[11px] text-zinc-500 mt-1">PDF documents only</span>
                  </>
                )}
              </label>
            ) : (
              /* Attached Paper Card */
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 space-y-3 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-zinc-200 truncate" title={docFile.name}>
                        {docFile.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {(docFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeDocument}
                    title="Remove paper"
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {docStats && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Pages</span>
                      <span className="font-mono text-zinc-200 font-medium">{docStats.pages}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Context Tokens</span>
                      <span className="font-mono text-indigo-400 font-medium">~{docStats.tokens.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="text-[11px] bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                    Text Preview
                  </span>
                  <p className="line-clamp-4 font-mono text-[10px] text-zinc-400 leading-relaxed">
                    {docText.slice(0, 350)}...
                  </p>
                </div>
              </div>
            )}

            {/* Quick Scientific Prompts */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Research Prompts
              </span>
              <div className="flex flex-col gap-1.5 text-xs">
                {[
                  "Synthesize methodology & novel contributions",
                  "Extract key empirical findings, datasets & metrics",
                  "Analyze research limitations & open questions",
                  "Draft an academic literature review summary",
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => applyResearchPrompt(promptText)}
                    className="text-left p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-indigo-300 border border-zinc-800/80 hover:border-indigo-500/30 transition text-[11px] leading-snug"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Context is automatically stuffed into every prompt.</span>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 select-text">
            {/* Warning if no key configured */}
            {!settings.apiKey && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-center justify-between text-amber-200">
                <div className="flex items-center gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>No API Key set. Please configure your custom key and endpoint to begin chatting.</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-md transition font-medium"
                >
                  Configure
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto text-zinc-500 py-12">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-200">Scientific Paper Assistant</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Upload a research paper in the left panel to ground answers in the complete full-text context, or start asking scientific questions directly.
                </p>

                {/* Mobile Upload Button */}
                <div className="mt-5 md:hidden">
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 cursor-pointer border border-zinc-700">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload PDF Document</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3.5 max-w-3xl ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {m.role === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`group relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-zinc-100 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Copy Button for Assistant */}
                    {m.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="absolute bottom-2 right-2 p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3.5 max-w-xl mr-auto">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Generating academic synthesis...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error.message || "An error occurred during communication."}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
            <div className="max-w-3xl mx-auto space-y-2">
              {/* Context indicator pill */}
              {docFile && (
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                    <FileCheck className="w-3 h-3 text-emerald-400" />
                    {docFile.name} (~{docStats?.tokens.toLocaleString()} tokens)
                  </span>
                  <span className="text-zinc-500">attached as grounded context</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    docFile
                      ? `Ask a question grounded in ${docFile.name}...`
                      : "Type your research inquiry or draft request..."
                  }
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 text-sm rounded-xl bg-zinc-900 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder:text-zinc-500 transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !settings.apiKey}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0 font-medium text-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {isLoaded && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}
