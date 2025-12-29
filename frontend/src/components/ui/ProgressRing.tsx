export function ProgressRing({
  value,
  size = 44,
  stroke = 5
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Progress ${clamped}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgb(20, 184, 166)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(230,237,247,0.9)"
        fontSize="11"
        fontWeight="600"
      >
        {clamped}%
      </text>
    </svg>
  );
}

