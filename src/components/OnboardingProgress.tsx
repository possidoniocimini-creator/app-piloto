import { ONBOARDING_SESSIONS } from "@/lib/onboarding-content";

export function OnboardingProgress({ currentSession }: { currentSession: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {ONBOARDING_SESSIONS.map((session) => (
        <div key={session.number} className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-surface2">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: session.number <= currentSession ? "100%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}
