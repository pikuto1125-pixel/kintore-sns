"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-all hover:opacity-80"
        style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        title="言語 / Language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-base leading-none">{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl border py-2 min-w-[160px] shadow-2xl"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all hover:bg-opacity-50"
                style={{
                  color: i18n.language === lang.code ? "var(--text-primary)" : "var(--text-secondary)",
                  background: i18n.language === lang.code ? "var(--surface-2)" : "transparent",
                  fontWeight: i18n.language === lang.code ? 600 : 400,
                }}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {i18n.language === lang.code && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
