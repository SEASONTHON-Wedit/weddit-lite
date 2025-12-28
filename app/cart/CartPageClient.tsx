'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { clearCompare, getCompareEntries, removeCompareId } from '@/components/cart/cartCookie'
import type { Vendor } from '@/types'

export default function CartPageClient() {
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

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
              비교함
            </h1>
            <div className="flex items-center gap-3">
              <Link href="/vendors" className="text-sm font-semibold text-white/90 underline underline-offset-4">
                업체 목록
              </Link>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearCompare()
                    sync()
                  }}
                  className="text-sm font-semibold text-white/90 underline underline-offset-4"
                >
                  비우기
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm sm:text-base text-white/85 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            로그인 없이도 브라우저 쿠키에 저장돼요. ({count}개)
          </p>
        </div>
      </Reveal>

      <div className="mt-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="panel-contrast p-6 sm:p-7 text-white/85">불러오는 중…</div>
        ) : count === 0 ? (
          <div className="panel-contrast p-6 sm:p-7">
            <div className="text-white font-semibold">아직 담긴 업체가 없어요.</div>
            <div className="mt-2 text-sm text-white/85">
              업체 상세에서 비교함에 담아두면, 나중에 한 번에 다시 확인할 수 있어요.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((v) => (
              <Reveal key={v.id}>
                <div className="panel-contrast p-5 sm:p-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{v.name}</div>
                    <div className="mt-1 text-sm text-white/80">
                      {v.region} · {v.category}
                    </div>
                    <Link href={`/vendors/${v.id}`} className="mt-3 inline-block text-sm font-semibold text-white underline underline-offset-4">
                      상세 보기
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCompareId(v.id)
                      sync()
                    }}
                    className="shrink-0 px-3 py-2 rounded-full text-sm font-semibold border border-white/30 bg-white/10 hover:bg-white/15 text-white transition-colors"
                  >
                    제거
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


