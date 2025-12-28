'use client'

import { useEffect, useMemo, useState } from 'react'
import LineChart from '@/components/LineChart'

type PriceGoResponse = {
  metric: 'season' | 'region'
  labels: string[]
  values: number[]
  unit?: string
  source?: string
  note?: string
}

export default function PriceGoStats() {
  const [data, setData] = useState<PriceGoResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/stats/pricego?metric=season')
        const json = (await res.json()) as PriceGoResponse
        if (!alive) return
        setData(json)
      } catch {
        if (!alive) return
        setData(null)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const title = useMemo(() => '예식 시기별 계약 금액 추이', [])
  const subtitle = useMemo(
    () =>
      '정부(참가격)에서 제공하는 결혼서비스 통계로, 시장 가격 흐름을 빠르게 파악할 수 있어요.',
    []
  )

  if (loading || !data) {
    return (
      <div className="panel-contrast rounded-3xl p-6 sm:p-8">
        <div className="h-5 w-48 rounded bg-white/10" />
        <div className="mt-3 h-9 w-80 rounded bg-white/10" />
        <div className="mt-6 h-[260px] sm:h-[320px] rounded-2xl border border-white/20 bg-black/15" />
      </div>
    )
  }

  return (
    <div>
      <LineChart
        title={title}
        subtitle={subtitle}
        labels={data.labels}
        values={data.values}
        unit={data.unit}
      />
      {data.source && (
        <div className="mt-3 text-sm text-white/85 text-shadow">
          출처: <a className="underline" href={data.source}>참가격 결혼서비스 통계</a>
        </div>
      )}
    </div>
  )
}


