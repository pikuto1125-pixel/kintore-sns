"use client";
import { useState } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";

type Props = { content: string; targetLang: string };

export default function TranslateButton({ content, targetLang }: Props) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const { t } = useTranslation("common");

  const handleTranslate = async () => {
    if (translated) { setShowTranslated(!showTranslated); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, targetLang }),
      });
      const data = await res.json();
      if (data.translated) { setTranslated(data.translated); setShowTranslated(true); }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="flex items-center gap-1 text-xs transition-all hover:opacity-70 disabled:opacity-40"
        style={{ color: "var(--text-secondary)" }}
      >
        <Languages className="w-3.5 h-3.5" />
        {loading ? t("translating") : showTranslated ? t("original") : t("translate")}
      </button>
      {showTranslated && translated && (
        <div
          className="text-sm leading-relaxed p-3 rounded-xl border-l-2"
          style={{ color: "var(--text-secondary)", borderColor: "var(--accent)", background: "var(--surface-2)" }}
        >
          {translated}
        </div>
      )}
    </div>
  );
}
