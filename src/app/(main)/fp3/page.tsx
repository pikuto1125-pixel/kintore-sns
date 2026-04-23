import Link from "next/link";
import { BookOpen, FileText, GraduationCap, ChevronRight, Target, Clock } from "lucide-react";
import { CATEGORIES, QUESTIONS } from "@/data/fp3-questions";

export default function FP3Page() {
  const totalQuestions = QUESTIONS.length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl" style={{ background: "var(--accent-2)" }}>
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>FP3級 学習アプリ</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>ファイナンシャル・プランニング技能検定 3級</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          全{totalQuestions}問の練習問題で合格を目指そう！<br />
          <span style={{ color: "var(--text-primary)" }}>カテゴリ別学習</span>で弱点を克服し、
          <span style={{ color: "var(--text-primary)" }}>本試験形式</span>で実力を確認できます。
        </p>
      </div>

      <Link
        href="/fp3/exam"
        className="block rounded-2xl p-5 border transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ff3d5f)", borderColor: "transparent" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-white" />
            <div>
              <p className="font-bold text-white text-lg leading-tight">本試験形式</p>
              <p className="text-white/70 text-xs mt-0.5">60問 · 120分タイマー · 試験後に解説</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">120分</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15">
            <Target className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">合格ライン60%</span>
          </div>
        </div>
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>カテゴリ別学習</h2>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const count = QUESTIONS.filter((q) => q.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/fp3/study?category=${cat.id}`}
                className="flex items-center justify-between p-4 rounded-xl border transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{cat.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs font-medium" style={{ color: cat.color }}>{count}問</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
