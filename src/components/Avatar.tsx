export function Avatar({
  fillPercent,
  goalReached,
}: {
  fillPercent: number;
  goalReached: boolean;
}) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));
  const svgHeight = 140;
  const fillY = svgHeight - (clampedFill / 100) * svgHeight;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-40">
        <svg viewBox="0 0 100 140" className="h-full w-full overflow-visible">
          <defs>
            <clipPath id="avatar-shape">
              <circle cx="50" cy="28" r="20" />
              <path d="M20 130 C20 80 30 58 50 58 C70 58 80 80 80 130 Z" />
            </clipPath>
            <linearGradient id="avatar-flame" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ff4d2e" />
              <stop offset="55%" stopColor="#f5871f" />
              <stop offset="100%" stopColor="#ffcf5c" />
            </linearGradient>
            {goalReached && (
              <filter id="avatar-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Contorno base (vazio) */}
          <g className="text-base-surface2" fill="currentColor">
            <circle cx="50" cy="28" r="20" />
            <path d="M20 130 C20 80 30 58 50 58 C70 58 80 80 80 130 Z" />
          </g>

          {/* Preenchimento animado conforme o progresso */}
          <g clipPath="url(#avatar-shape)" filter={goalReached ? "url(#avatar-glow)" : undefined}>
            <rect
              x="0"
              y={fillY}
              width="100"
              height={svgHeight}
              fill="url(#avatar-flame)"
              style={{ transition: "y 0.6s ease" }}
            />
          </g>

          {/* Contorno por cima */}
          <g className="text-base-border" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="28" r="20" />
            <path d="M20 130 C20 80 30 58 50 58 C70 58 80 80 80 130 Z" />
          </g>
        </svg>
      </div>
      <p className="mt-2 bg-flame bg-clip-text text-3xl font-bold text-transparent">
        {clampedFill}%
      </p>
      <p className="text-sm text-white/50">
        {goalReached ? "Eu ideal conquistado 🎉" : "do caminho até o seu eu ideal"}
      </p>
    </div>
  );
}
