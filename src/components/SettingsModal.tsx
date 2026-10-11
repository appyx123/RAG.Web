"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSettings, POPULAR_MODELS } from "@/types/settings";
import {
  Settings,
  X,
  Save,
  Key,
  Globe,
  Cpu,
  HelpCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: Props) {
  const [form, setForm] = useState<AppSettings>(settings);
  const [detectedModels, setDetectedModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);

  // Fetch models from endpoint
  const fetchModelsFromEndpoint = useCallback(
    async (url: string, key: string) => {
      if (!url.trim() || !key.trim()) return;

      setIsLoadingModels(true);
      setModelsError(null);

      try {
        const res = await fetch("/api/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseURL: url, apiKey: key }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Reset detected models on failure to prevent stale UI state
          setDetectedModels([]);
          throw new Error(data.error || "Gagal mengambil daftar model dari endpoint");
        }

        if (Array.isArray(data.models) && data.models.length > 0) {
          setDetectedModels(data.models);
          // If current selected model is not in list, auto-select first model
          setForm((prev) => {
            if (!data.models.includes(prev.model)) {
              return { ...prev, model: data.models[0] };
            }
            return prev;
          });
        } else {
          setDetectedModels([]);
          setModelsError("Endpoint tidak mengembalikan daftar model. Silakan ketik manual.");
        }
      } catch (err: any) {
        setDetectedModels([]);
        setModelsError(err.message || "Gagal menghubungi endpoint.");
      } finally {
        setIsLoadingModels(false);
      }
    },
    []
  );

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setForm(settings);
      setSearchQuery("");
      setModelsError(null);

      // Auto fetch if base url and api key are present
      if (settings.baseURL && settings.apiKey) {
        fetchModelsFromEndpoint(settings.baseURL, settings.apiKey);
      }
    }
  }, [isOpen, settings, fetchModelsFromEndpoint]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  // Filter models by search query
  const filteredModels = detectedModels.filter((m) =>
    m.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">BYOK API Configuration</h2>
              <p className="text-xs text-zinc-400">Deteksi otomatis model & pengaturan endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 overflow-y-auto pr-1 flex-1">
          {/* Custom Base URL */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Custom API Base URL
            </label>
            <input
              type="url"
              required
              placeholder="https://api.openai.com/v1"
              value={form.baseURL}
              onChange={(e) => {
                setForm({ ...form, baseURL: e.target.value });
                setModelsError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200 transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Contoh: <code className="text-zinc-400 font-mono">https://api.openai.com/v1</code>, <code className="text-zinc-400 font-mono">https://openrouter.ai/api/v1</code>, atau URL proxy Anda.
            </p>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> API Key
              </label>
              {form.baseURL && form.apiKey && (
                <button
                  type="button"
                  onClick={() => fetchModelsFromEndpoint(form.baseURL, form.apiKey)}
                  disabled={isLoadingModels}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingModels ? "animate-spin" : ""}`} />
                  {isLoadingModels ? "Mendeteksi..." : "Deteksi Ulang Model"}
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => {
                setForm({ ...form, apiKey: e.target.value });
                setModelsError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200 transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-zinc-600 inline shrink-0" />
              Tersimpan di LocalStorage browser. Pastikan key sesuai dengan Base URL yang Anda isi.
            </p>
          </div>

          {/* Model Selection (Auto Detected) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Model dari Endpoint
              </label>

              <div className="flex items-center gap-2">
                {detectedModels.length > 0 && !isLoadingModels && !modelsError && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {detectedModels.length} model terdeteksi
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition"
                >
                  {isManualInput ? "Pilih dari list" : "Input manual"}
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoadingModels && (
              <div className="py-3 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Mendeteksi model yang tersedia di endpoint...</span>
              </div>
            )}

            {/* Error message */}
            {modelsError && !isLoadingModels && (
              <div className="py-2.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-amber-300">Gagal Mendeteksi Model</p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{modelsError}</p>
                </div>
              </div>
            )}

            {/* Manual input mode */}
            {isManualInput ? (
              <div>
                <input
                  type="text"
                  placeholder="Ketik model ID (contoh: gpt-4o, claude-3-5-sonnet-20240620)"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200"
                />
              </div>
            ) : detectedModels.length > 0 ? (
              /* Detected Models Selector */
              <div className="space-y-2">
                {/* Search box if there are more than 6 models */}
                {detectedModels.length > 6 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Cari model (misal: claude, gpt, deepseek)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-indigo-500 text-zinc-200"
                    />
                  </div>
                )}

                {/* Dropdown Select */}
                <div className="relative">
                  <select
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-indigo-500 font-mono text-zinc-100 appearance-none pr-8 cursor-pointer"
                  >
                    {/* Ensure selected model is in options if not filtered */}
                    {!filteredModels.includes(form.model) && form.model && (
                      <option value={form.model}>{form.model} (terpilih)</option>
                    )}
                    {filteredModels.map((modelId) => (
                      <option key={modelId} value={modelId}>
                        {modelId}
                      </option>
                    ))}
                    {filteredModels.length === 0 && !form.model && (
                      <option disabled>Tidak ada model yang cocok dengan pencarian</option>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              /* Fallback presets if not fetched yet or error */
              <div className="space-y-1.5">
                <select
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200"
                >
                  {POPULAR_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} ({m.value})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500">
                  💡 Masukkan Base URL & API Key yang valid lalu klik &quot;Deteksi Ulang Model&quot;.
                </p>
              </div>
            )}

            {/* Currently selected model badge */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Model Terpilih:</span>
              <span className="font-mono text-indigo-300 font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 truncate max-w-[240px]">
                {form.model || "Belum dipilih"}
              </span>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
              System Prompt (Research Persona)
            </label>
            <textarea
              rows={3}
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 text-zinc-200 resize-none transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
