'use client'

import { memo, useEffect, useMemo, useState } from 'react'

type LineChartLightProps = {
  title: string
  subtitle?: string
  labels: string[]
  values: number[]
  unit?: string
  className?: string
  /** 박스/카드 없이 섹션처럼 렌더링(v2 메인 모바일용) */
  plain?: boolean
  /** 차트 주변 박스(rounded/border/bg) 제거 */
  bare?: boolean
}

function niceNum(range: number, round: boolean) {
  // "Nice Numbers for Graph Labels" 스타일
  const exponent = Math.floor(Math.log10(Math.max(range, 1e-9)))
  const fraction = range / Math.pow(10, exponent)
  let niceFraction: number
  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }
  return niceFraction * Math.pow(10, exponent)
}

function niceScaleMaxTicks(min: number, max: number, maxTicks: number) {
  // tickCount는 "구간 수" (예: 1000~1500 step 100 => 5구간, 라벨은 6개)
  const rawRange = Math.max(1e-9, max - min)
  // 시작은 4~5구간 정도를 목표로
  let step = niceNum(rawRange / Math.max(1, Math.min(5, maxTicks)), true)
  let niceMin = Math.floor(min / step) * step
  let niceMax = Math.ceil(max / step) * step

  const tickCount = () => Math.max(1, Math.round((niceMax - niceMin) / step))

  // 너무 촘촘하면 step을 키운다(최대 8회만 조정)
  for (let i = 0; i < 8; i++) {
    if (tickCount() <= maxTicks) break
    step = niceNum(step * 1.8, true)
    niceMin = Math.floor(min / step) * step
    niceMax = Math.ceil(max / step) * step
  }

  // 너무 듬성하면 step을 줄인다(최소 3구간 정도)
  for (let i = 0; i < 8; i++) {
    if (tickCount() >= Math.min(3, maxTicks)) break
    step = niceNum(step / 1.8, true)
    niceMin = Math.floor(min / step) * step
    niceMax = Math.ceil(max / step) * step
  }

  return { niceMin, niceMax, step, tickCount: tickCount() }
}

const LineChartLight = ({
  title,
  subtitle,
  labels,
  values,
  unit,
  className = '',
  plain = false,
  bare = false,
}: LineChartLightProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [vw, setVw] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))

  // SVG viewBox를 화면 폭에 맞춰 조정(초기 1프레임 점프 방지 + 리사이즈 대응)
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth || 1024)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const w = useMemo(() => {
    const width = vw || 1024
    if (width < 420) return 420
    if (width < 720) return 520
    if (width < 1024) return 760
    return 920
  }, [vw])
  const h = 250

  // 내부 여백(특히 상단)은 툴팁/라벨이 잘리지 않도록 충분히 확보
  // 축 라벨이 잘리지 않게 “라벨용 여백(left)”은 확보하되, 컴포넌트 외부 여백은(v2에서) 풀블리드로 해결
  const left = w <= 520 ? 44 : 52
  const right = w <= 520 ? 12 : 18
  const top = w <= 520 ? 34 : 28
  const bottom = w <= 520 ? 44 : 38

  const plotW = w - left - right
  const plotH = h - top - bottom

  const safeValues = values.length ? values : [0]
  const rawMin = Math.min(...safeValues)
  const rawMax = Math.max(...safeValues)
  const rawRange = Math.max(1, rawMax - rawMin)

  // y축은 "딱 떨어지는" 단위를 우선. 데이터에 살짝 패딩을 준 뒤 nice scale로 맞춘다.
  const paddedMin = rawMin - rawRange * 0.06
  const paddedMax = rawMax + rawRange * 0.14

  const { niceMin, niceMax, step: yStep, tickCount: yTicks } = niceScaleMaxTicks(paddedMin, paddedMax, 6)
  const rangeAdj = Math.max(1, niceMax - niceMin)

  const n = Math.max(1, values.length)
  const x = (i: number) => left + (plotW * (n === 1 ? 0 : i / (n - 1)))
  const y = (v: number) => top + plotH - ((v - niceMin) / rangeAdj) * plotH

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const linePath = values.length
    ? `M ${values.map((v, i) => `${x(i)} ${y(v)}`).join(' L ')}`
    : `M ${left} ${top + plotH} L ${left + plotW} ${top + plotH}`
  const area = `${left},${top + plotH} ${points} ${left + plotW},${top + plotH}`

  const grid = Array.from({ length: yTicks + 1 }).map((_, i) => {
    const yy = top + (plotH * i) / yTicks
    const val = Math.round(niceMax - yStep * i)
    return { yy, val }
  })

  const shownLabels = labels.length ? labels.map((t, i) => ({ t, i })) : values.map((_, i) => ({ t: String(i + 1), i }))
  const step = shownLabels.length > 8 ? Math.ceil(shownLabels.length / 6) : 1

  const chartBoxClass = bare ? '' : 'overflow-hidden rounded-2xl bg-white'

  const selected = selectedIdx == null ? null : { i: selectedIdx, cx: x(selectedIdx), cy: y(values[selectedIdx] ?? 0) }
  const selLabel = selected ? (labels[selected.i] ?? String(selected.i + 1)) : ''
  const selVal = selected ? (values[selected.i] ?? 0) : 0
  const selValText = unit ? `${selVal.toLocaleString()} ${unit}` : selVal.toLocaleString()

  const tip = selected
    ? (() => {
        const maxW = w <= 520 ? 120 : 150
        const tx = Math.max(left + maxW / 2, Math.min(left + plotW - maxW / 2, selected.cx))
        // 툴팁은 rect 기준 top을 계산해서 항상 화면 안에 보이게
        const rectH = w <= 520 ? 44 : 48
        const desiredTop = selected.cy - (rectH + 12)
        const topClamp = Math.max(top + 6, Math.min(top + plotH - rectH - 6, desiredTop))
        return { tx, top: topClamp, w: maxW, h: rectH }
      })()
    : null

  return (
    <div className={plain ? '' : className}>
      {!plain && (
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 className="mt-2 text-2xl lg:text-4xl font-semibold tracking-tight text-gray-900">{title}</h3>
            {subtitle && <p className="mt-3 text-base lg:text-lg text-gray-600">{subtitle}</p>}
          </div>
          {unit && (
            <div className="text-sm text-gray-700 border border-black/10 bg-white px-3 py-2 rounded-full">
              단위: {unit}
            </div>
          )}
        </div>
      )}

      <div className={`${plain ? '' : 'mt-5 lg:mt-6'} ${chartBoxClass}`}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full"
          onClick={() => setSelectedIdx(null)}
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="lineAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(16,185,129,0.18)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.00)" />
            </linearGradient>
          </defs>

          {grid.map((g, idx) => (
            <g key={idx}>
              <line x1={left} x2={left + plotW} y1={g.yy} y2={g.yy} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
              <text
                x={left - 8}
                y={g.yy - 6}
                fill="rgba(0,0,0,0.50)"
                fontSize={w <= 520 ? 14 : 12}
                textAnchor="end"
              >
                {g.val}
              </text>
            </g>
          ))}

          {selected && (
            <line
              x1={selected.cx}
              x2={selected.cx}
              y1={top}
              y2={top + plotH}
              stroke="rgba(16,185,129,0.25)"
              strokeWidth="2"
            />
          )}

          <polygon points={area} fill="url(#lineAreaLight)" className="lc-area-fade" />

          <path
            d={linePath}
            fill="none"
            stroke="rgba(16,185,129,0.95)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            className="lc-line-draw"
          />

          {values.map((v, i) => (
            <g key={i}>
              <circle
                cx={x(i)}
                cy={y(v)}
                r={11}
                fill="transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIdx(i)
                }}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={x(i)}
                cy={y(v)}
                r={selectedIdx === i ? 6 : 4}
                fill={selectedIdx === i ? 'rgba(16,185,129,0.95)' : 'white'}
                stroke="rgba(16,185,129,0.95)"
                strokeWidth="2"
                pointerEvents="none"
              />
            </g>
          ))}

          {selected && tip && (
            <g pointerEvents="none">
              <circle cx={selected.cx} cy={selected.cy} r={9} fill="rgba(16,185,129,0.12)" />
              <rect
                x={tip.tx - tip.w / 2}
                y={tip.top}
                width={tip.w}
                height={tip.h}
                rx={12}
                fill="rgba(255,255,255,0.8)"
                stroke="rgba(0,0,0,0.10)"
              />
              <text x={tip.tx} y={tip.top + (w <= 520 ? 18 : 20)} fill="rgba(0,0,0,0.72)" fontSize={w <= 520 ? 13 : 14} textAnchor="middle">
                {selLabel}
              </text>
              <text x={tip.tx} y={tip.top + (w <= 520 ? 34 : 38)} fill="rgba(0,0,0,0.90)" fontSize={w <= 520 ? 15 : 16} fontWeight="800" textAnchor="middle">
                {selValText}
              </text>
            </g>
          )}

          {shownLabels
            .filter((_, i) => i % step === 0)
            .map(({ t, i }) => (
              <text
                key={i}
                x={i === 0 ? left : i === n - 1 ? left + plotW : x(i)}
                y={top + plotH + 22}
                fill="rgba(0,0,0,0.55)"
                fontSize={w <= 520 ? 14 : 12}
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              >
                {t}
              </text>
            ))}
        </svg>
      </div>
    </div>
  )
}

export default memo(LineChartLight)


