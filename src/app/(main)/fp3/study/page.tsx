import { Suspense } from "react";
import { CATEGORIES } from "@/data/fp3-questions";
import StudyQuiz from "@/components/fp3/StudyQuiz";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function StudyPage({ searchParams }: Props) {
  const { category = "life" } = await searchParams;
  const cat = CATEGORIES.find((c) => c.id === category);
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent-2) transparent transparent transparent" }} />
      </div>
    }>
      <StudyQuiz category={category} categoryName={cat?.name ?? "学習"} categoryColor={cat?.color ?? "#7c3aed"} />
    </Suspense>
  );
}
