'use client'

import LineChartLight from '@/components/LineChartLight'
import { useEffect, useMemo, useState } from 'react'

type PriceGoResponse = {
  metric: 'season' | 'region'
  labels: string[]
  values: number[]
  unit?: string
  source?: string
  note?: string
}

export default function PriceGoStatsLight() {
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
    () => '공개된 결혼서비스 통계로 “평균 가격 흐름”을 빠르게 확인합니다.',
    []
  )

  if (loading || !data) {
    return (
      <div>
        <div className="h-5 w-48 rounded bg-black/5" />
        <div className="mt-3 h-9 w-80 rounded bg-black/5" />
        <div className="mt-6 h-[260px] sm:h-[320px] rounded-2xl border border-black/10 bg-white" />
      </div>
    )
  }

  return (
    <div>
      <LineChartLight
        title={title}
        subtitle={subtitle}
        labels={data.labels}
        values={data.values}
        unit={data.unit}
      />
      {data.source && (
        <div className="mt-3 text-sm text-gray-600">
          출처: <a className="underline" href={data.source}>참가격 결혼서비스 통계</a>
        </div>
      )}
    </div>
  )
}


