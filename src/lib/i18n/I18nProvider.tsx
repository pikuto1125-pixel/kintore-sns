"use client";
import { useEffect } from "react";
import "@/lib/i18n/config";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n auto-initializes via import
  }, []);
  return <>{children}</>;
}
