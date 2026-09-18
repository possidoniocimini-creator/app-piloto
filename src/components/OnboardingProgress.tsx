export function OnboardingProgress({
  currentSession,
  totalSessions,
}: {
  currentSession: number;
  totalSessions: number;
}) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: totalSessions }, (_, i) => i + 1).map((number) => (
        <div key={number} className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-surface2">
          <div
            className="h-full rounded-full bg-flame transition-all"
            style={{ width: number <= currentSession ? "100%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}
