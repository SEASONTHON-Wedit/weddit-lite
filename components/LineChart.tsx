type LineChartProps = {
  title: string
  subtitle?: string
  labels: string[]
  values: number[]
  unit?: string
  className?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function LineChart({
  title,
  subtitle,
  labels,
  values,
  unit,
  className = '',
}: LineChartProps) {
  const w = 920
  const h = 320
  const padX = 28
  const padY = 20
  const plotW = w - padX * 2
  const plotH = h - padY * 2

  const safeValues = values.length ? values : [0]
  const min = Math.min(...safeValues)
  const max = Math.max(...safeValues)
  const range = Math.max(1, max - min)

  const n = Math.max(1, values.length)
  const x = (i: number) => padX + (plotW * (n === 1 ? 0 : i / (n - 1)))
  const y = (v: number) => padY + plotH - ((v - min) / range) * plotH

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const area = `${padX},${padY + plotH} ${points} ${padX + plotW},${padY + plotH}`

  const gridLines = 4
  const grid = Array.from({ length: gridLines + 1 }).map((_, i) => {
    const yy = padY + (plotH * i) / gridLines
    const val = Math.round(max - (range * i) / gridLines)
    return { yy, val }
  })

  const shownLabels = labels.length
    ? labels.map((t, i) => ({ t, i }))
    : values.map((_, i) => ({ t: String(i + 1), i }))
  const step = shownLabels.length > 8 ? Math.ceil(shownLabels.length / 6) : 1

  return (
    <div className={`panel-contrast rounded-3xl p-6 sm:p-8 ${className}`}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-base text-white/90 text-shadow">통계(참가격)</div>
          <h3 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white text-shadow">
            {title}
          </h3>
          {subtitle && <p className="mt-2 text-base text-white/90 text-shadow">{subtitle}</p>}
        </div>
        {unit && (
          <div className="text-sm text-white/85 text-shadow border border-white/30 bg-white/10 px-3 py-2 rounded-full">
            단위: {unit}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/25 bg-black/15">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[260px] sm:h-[320px]">
          <defs>
            <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>

          {/* grid */}
          {grid.map((g, idx) => (
            <g key={idx}>
              <line
                x1={padX}
                x2={padX + plotW}
                y1={g.yy}
                y2={g.yy}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <text
                x={padX}
                y={g.yy - 6}
                fill="rgba(255,255,255,0.65)"
                fontSize="12"
              >
                {g.val}
              </text>
            </g>
          ))}

          {/* area */}
          <polygon points={area} fill="url(#lineArea)" />

          {/* line */}
          <polyline
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* dots */}
          {values.map((v, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r={4}
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="2"
            />
          ))}

          {/* x labels */}
          {shownLabels
            .filter((_, i) => i % step === 0)
            .map(({ t, i }) => (
              <text
                key={i}
                x={x(i)}
                y={padY + plotH + 18}
                fill="rgba(255,255,255,0.80)"
                fontSize="12"
                textAnchor="middle"
              >
                {t}
              </text>
            ))}
        </svg>
      </div>
    </div>
  )
}


