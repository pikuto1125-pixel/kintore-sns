"use client";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ fullscreen }: { fullscreen?: boolean }) {
  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>読み込み中...</span>
        </div>
      </div>
    );
  }
  return <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--accent)" }} />;
}
