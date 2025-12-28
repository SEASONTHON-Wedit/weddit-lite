'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { clearCompare, getCompareEntries, removeCompareId } from '@/components/cart/cartCookie'
import type { Vendor } from '@/types'
import { CategoryLabels, RegionLabels } from '@/types'

export default function V2CartPageClient() {
  const [entries, setEntries] = useState<ReturnType<typeof getCompareEntries>>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  const sync = () => setEntries(getCompareEntries())

  useEffect(() => {
    sync()
    const on = () => sync()
    window.addEventListener('weddit:compare-changed', on as any)
    return () => window.removeEventListener('weddit:compare-changed', on as any)
  }, [])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      try {
        if (!entries.length) {
          if (mounted) setVendors([])
          return
        }
        const res = await Promise.all(
          entries.map(async (e) => {
            const r = await fetch(`/api/vendors/${e.id}`)
            if (!r.ok) return null
            return (await r.json()) as Vendor
          }),
        )
        const list = res.filter(Boolean) as Vendor[]
        if (mounted) setVendors(list)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [entries])

  const count = useMemo(() => entries.length, [entries])

  const entryById = useMemo(() => {
    const m = new Map<string, (typeof entries)[number]>()
    for (const e of entries) m.set(e.id, e)
    return m
  }, [entries])

  const computeSelected = (v: Vendor) => {
    const e = entryById.get(v.id)
    const single = e?.selection?.single ?? {}
    const multi = e?.selection?.multi ?? {}
    let total = 0
    const lines: string[] = []

    for (const it of v.items ?? []) {
      const mode = it.selectionMode ?? 'single'
      if (mode === 'multi') {
        const ids = multi[it.id] ?? []
        if (ids.length) {
          const names = ids
            .map((pid) => it.prices.find((p) => p.id === pid))
            .filter(Boolean)
            .map((p) => p?.name || '옵션')
          const sum = ids.reduce((s, pid) => s + (it.prices.find((p) => p.id === pid)?.price ?? 0), 0)
          total += sum
          lines.push(`${it.name}: ${names.join(' + ')}`)
        }
      } else {
        const pid = single[it.id]
        if (!pid || pid === '__none__') continue
        const p = it.prices.find((x) => x.id === pid)
        if (!p) continue
        total += p.price
        lines.push(`${it.name}: ${p.name || '기본'}`)
      }
    }

    return { total, lines }
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">비교함</h1>
            <div className="flex items-center gap-3">
              <Link href="/v2/vendors" className="text-sm font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-4">
                업체 목록
              </Link>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearCompare()
                    sync()
                  }}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 underline underline-offset-4"
                >
                  비우기
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            로그인 없이도 브라우저 쿠키에 저장돼요. ({count}개)
          </p>
        </div>
      </Reveal>

      <div className="mt-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-7 text-gray-700">
            불러오는 중…
          </div>
        ) : count === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-7">
            <div className="text-gray-900 font-semibold">아직 담긴 업체가 없어요.</div>
            <div className="mt-2 text-sm text-gray-700">
              업체 상세에서 비교함에 담아두면, 나중에 한 번에 다시 확인할 수 있어요.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((v) => (
              <Reveal key={v.id}>
                {(() => {
                  const { total, lines } = computeSelected(v)
                  return (
                <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-5 sm:p-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-gray-900 font-semibold truncate">{v.name}</div>
                    <div className="mt-1 text-sm text-gray-700">
                      {RegionLabels[v.region]} · {CategoryLabels[v.category]}
                    </div>
                    {lines.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {lines.join(' · ')}
                      </div>
                    )}
                    <Link href={`/v2/vendors/${v.id}`} className="mt-3 inline-block text-sm font-semibold text-gray-900 underline underline-offset-4">
                      상세 보기
                    </Link>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-gray-500">선택 합계</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                      {new Intl.NumberFormat('ko-KR').format(total)}원
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeCompareId(v.id)
                        sync()
                      }}
                      className="mt-3 inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border border-black/10 bg-white hover:bg-black/5 text-gray-900 transition-colors"
                    >
                      제거
                    </button>
                  </div>
                </div>
                  )
                })()}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


