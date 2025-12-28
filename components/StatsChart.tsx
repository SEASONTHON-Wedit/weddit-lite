import { Vendor, Category, CategoryLabels } from '@/types'

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length === 0) return null
  if (sorted.length % 2 === 1) return sorted[mid]!
  return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
}

function formatWon(n: number) {
  return new Intl.NumberFormat('ko-KR').format(n)
}

function getAllPrices(vendors: Vendor[]) {
  return vendors.flatMap((v) => v.items.flatMap((i) => i.prices.map((p) => p.price)))
}

function groupByCategory(vendors: Vendor[]) {
  const map = new Map<Category, number[]>()
  for (const v of vendors) {
    const prices = v.items.flatMap((i) => i.prices.map((p) => p.price))
    if (!map.has(v.category)) map.set(v.category, [])
    map.get(v.category)!.push(...prices)
  }
  return map
}

export default function StatsChart({ vendors }: { vendors: Vendor[] }) {
  const all = getAllPrices(vendors)
  const overallMin = all.length ? Math.min(...all) : null
  const overallMax = all.length ? Math.max(...all) : null
  const overallMed = median(all)

  const catMap = groupByCategory(vendors)
  const rows = (Object.keys(CategoryLabels) as unknown as Category[]).map((cat) => {
    const prices = catMap.get(cat) ?? []
    const med = median(prices)
    return { cat, label: CategoryLabels[cat], median: med, count: prices.length }
  })

  const maxMedian = Math.max(
    1,
    ...rows.map((r) => (typeof r.median === 'number' ? r.median : 0))
  )

  return (
    <div className="panel rounded-3xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-base text-white/90 text-shadow">현재 결혼업체 가격 통계</div>
          <h3 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white/95">
            한눈에 보는 가격 분포
          </h3>
          <p className="mt-2 text-base text-white/85 text-shadow">
            데이터가 쌓일수록 통계가 더 정확해져요. (표본: {all.length}개 가격)
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="panel rounded-2xl px-4 py-3">
            <div className="text-xs text-white/85">최저</div>
            <div className="text-lg font-semibold text-white/95">
              {overallMin === null ? '-' : `${formatWon(overallMin)}원`}
            </div>
          </div>
          <div className="panel rounded-2xl px-4 py-3">
            <div className="text-xs text-white/85">중앙값</div>
            <div className="text-lg font-semibold text-white/95">
              {overallMed === null ? '-' : `${formatWon(overallMed)}원`}
            </div>
          </div>
          <div className="panel rounded-2xl px-4 py-3">
            <div className="text-xs text-white/85">최고</div>
            <div className="text-lg font-semibold text-white/95">
              {overallMax === null ? '-' : `${formatWon(overallMax)}원`}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 soft-divider pt-6">
        <div className="text-base font-semibold text-white/95 mb-3 text-shadow">카테고리별 중앙값</div>
        <div className="space-y-3">
          {rows.map((r) => {
            const widthPct =
              typeof r.median === 'number' ? Math.max(8, Math.round((r.median / maxMedian) * 100)) : 8
            return (
              <div key={r.cat} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-3 sm:col-span-2 text-base text-white/90 text-shadow">{r.label}</div>
                <div className="col-span-6 sm:col-span-7">
                  <div className="h-11 rounded-2xl border border-white/28 bg-black/20 overflow-hidden">
                    <div
                      className="h-full rounded-2xl bg-white/35 border border-white/45"
                      style={{ width: `${widthPct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <div className="text-base font-semibold text-white/95 text-shadow">
                    {typeof r.median === 'number' ? `${formatWon(r.median)}원` : '-'}
                  </div>
                  <div className="text-xs text-white/80">{r.count}개 가격</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


