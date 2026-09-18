export function AvatarImage({
  imageUrl,
  fillPercent,
  goalReached,
}: {
  imageUrl: string;
  fillPercent: number;
  goalReached: boolean;
}) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));
  const blur = ((100 - clampedFill) / 100) * 10;
  const grayscale = 100 - clampedFill;
  const opacity = 0.45 + (clampedFill / 100) * 0.55;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative h-56 w-56 overflow-hidden rounded-2xl border ${
          goalReached ? "border-accent-gold shadow-flame" : "border-base-border"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Sua visão de futuro"
          className="h-full w-full object-cover transition-all duration-700"
          style={{
            filter: `blur(${blur}px) grayscale(${grayscale}%)`,
            opacity,
          }}
        />
      </div>
      <p className="mt-2 bg-flame bg-clip-text text-3xl font-bold text-transparent">
        {clampedFill}%
      </p>
      <p className="text-sm text-white/50">
        {goalReached ? "Você chegou no seu eu ideal 🎉" : "do caminho até o seu eu ideal"}
      </p>
    </div>
  );
}
