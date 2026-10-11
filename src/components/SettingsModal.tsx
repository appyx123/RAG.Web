"use client";

import { useState, useEffect } from "react";
import { AppSettings, POPULAR_MODELS } from "@/types/settings";
import { Settings, X, Save, Key, Globe, Cpu, HelpCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: Props) {
  const [form, setForm] = useState<AppSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const isPreset = POPULAR_MODELS.some((m) => m.value === form.model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">BYOK API Configuration</h2>
              <p className="text-xs text-zinc-400">Bring Your Own Key credentials & endpoint settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
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
              onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200 transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Supports OpenAI direct or OpenAI-compatible gateways (e.g. OpenRouter, Groq, custom proxy).
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" /> API Key
            </label>
            <input
              type="password"
              required
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200 transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-zinc-600 inline" />
              Credentials are saved only in your browser LocalStorage and dispatched per request.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Target Model
            </label>
            <div className="space-y-2">
              <select
                value={isPreset ? form.model : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") {
                    setForm({ ...form, model: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 text-zinc-200"
              >
                {POPULAR_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value})
                  </option>
                ))}
                <option value="custom">Custom Model ID...</option>
              </select>

              <input
                type="text"
                placeholder="Model Identifier (e.g., claude-3-5-sonnet-20240620, gpt-4o)"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-950/80 border border-zinc-700/80 focus:outline-none focus:border-indigo-500 font-mono text-zinc-200 text-xs"
              />
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

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
