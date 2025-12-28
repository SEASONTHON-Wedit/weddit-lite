'use client'

import FilterBar from '@/components/FilterBar'
import KakaoMap, { MapMarker } from '@/components/KakaoMap'
import Reveal from '@/components/Reveal'
import VendorCard from '@/components/VendorCard'
import { Category, CategoryLabels, Region, RegionLabels, Vendor } from '@/types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function parseCategory(v: string | null): Category | null {
  if (!v) return null
  return (Object.values(Category) as string[]).includes(v) ? (v as Category) : null
}

function parseRegion(v: string | null): Region | null {
  if (!v) return null
  return (Object.values(Region) as string[]).includes(v) ? (v as Region) : null
}

export default function VendorsPageClient() {
  const sp = useSearchParams()

  const initial = useMemo(() => {
    return {
      category: parseCategory(sp.get('category')),
      region: parseRegion(sp.get('region')),
      minPrice: sp.get('minPrice') ?? '',
      maxPrice: sp.get('maxPrice') ?? '',
    }
  }, [sp])

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initial.category)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(initial.region)
  const [minPrice, setMinPrice] = useState(initial.minPrice)
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [geoByVendorId, setGeoByVendorId] = useState<Record<string, { lat: number; lng: number }>>({})
  const geoReqInFlight = useRef<Set<string>>(new Set())

  useEffect(() => {
    // URL로 진입 시 초기값 반영(한 번)
    setSelectedCategory(initial.category)
    setSelectedRegion(initial.region)
    setMinPrice(initial.minPrice)
    setMaxPrice(initial.maxPrice)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedRegion) params.append('region', selectedRegion)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      const response = await fetch(`/api/vendors?${params.toString()}`)
      if (!response.ok) {
        let msg = `업체 목록을 불러오지 못했습니다. (${response.status})`
        try {
          const err = await response.json()
          if (err?.error) msg = String(err.error)
        } catch {}
        throw new Error(msg)
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.')
      }
      setVendors(data as Vendor[])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
      setErrorMessage(error instanceof Error ? error.message : '업체 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [maxPrice, minPrice, selectedCategory, selectedRegion])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  // 필터가 바뀌면 페이지/선택 초기화
  useEffect(() => {
    setPage(1)
    setSelectedVendorId(null)
  }, [selectedCategory, selectedRegion, minPrice, maxPrice])

  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedVendors = vendors.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || null
  }, [selectedVendorId, vendors])

  const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n)
  const getMinMax = (v: Vendor) => {
    const all = v.items.flatMap((it) => it.prices.map((p) => p.price))
    if (!all.length) return { min: null as number | null, max: null as number | null }
    return { min: Math.min(...all), max: Math.max(...all) }
  }

  // 현재 페이지 업체들만 좌표 요청(업체명 + 지역으로 카카오 장소검색)
  useEffect(() => {
    const need = pagedVendors.filter((v) => !geoByVendorId[v.id])

    if (need.length === 0) return

    need.forEach(async (v) => {
      if (geoReqInFlight.current.has(v.id)) return
      geoReqInFlight.current.add(v.id)
      try {
        const q = `${v.name} ${RegionLabels[v.region]}`
        const res = await fetch(`/api/kakao/place-search?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const json = await res.json()
        if (!json?.lat || !json?.lng) return
        setGeoByVendorId((prev) => ({ ...prev, [v.id]: { lat: json.lat, lng: json.lng } }))
      } finally {
        geoReqInFlight.current.delete(v.id)
      }
    })
  }, [geoByVendorId, pagedVendors])

  const markers: MapMarker[] = useMemo(() => {
    return pagedVendors
      .map((v) => {
        const g = geoByVendorId[v.id]
        if (!g) return null
        return { id: v.id, title: v.name, lat: g.lat, lng: g.lng }
      })
      .filter((x): x is MapMarker => !!x)
  }, [geoByVendorId, pagedVendors])

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* 헤더 */}
      <Reveal>
        <div className="text-shadow">
          <div className="text-base text-white/90">업체 찾기</div>
          <div className="mt-1 flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              지도에서 보고, 리스트로 비교하기
            </h1>
            <Link
              href="/#compare"
              className="px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors text-sm font-semibold text-white text-shadow"
            >
              ← 홈으로
            </Link>
          </div>
          <p className="mt-3 text-lg text-white/90 max-w-[72ch]">
            핀을 눌러 업체를 선택하면 아래에 프리뷰가 뜨고, 프리뷰/리스트를 누르면 상세 가격표로 이동합니다.
          </p>
        </div>
      </Reveal>

      {/* 필터(우리 스타일) */}
      <div className="mt-6">
        <Reveal>
          <FilterBar
            variant="glass"
            sticky
            selectedCategory={selectedCategory}
            selectedRegion={selectedRegion}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={setSelectedCategory}
            onRegionChange={setSelectedRegion}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </Reveal>
      </div>

      {/* 지도 */}
      <section className="mt-8">
        <Reveal>
          <div className="text-shadow">
            <div className="text-base text-white/90">지도</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              업체 위치를 한눈에 보기
            </h2>
            <p className="mt-2 text-base text-white/90">
              업체명 + 지역으로 검색된 위치를 핀으로 표시합니다. (현재 페이지 기준)
            </p>
          </div>

          <div className="mt-5 panel-contrast rounded-3xl p-3 sm:p-4">
            <div className="rounded-2xl overflow-hidden border border-white/25 h-[420px]">
              <KakaoMap
                className="h-full"
                markers={markers}
                selectedId={selectedVendorId}
                onSelect={(id) => setSelectedVendorId(id)}
              />
            </div>
          </div>
        </Reveal>

        {selectedVendor && (
          <Reveal className="mt-6">
            <div className="flex items-center justify-between gap-4 flex-wrap text-shadow">
              <div className="text-base text-white/90">선택한 업체</div>
              <button
                onClick={() => setSelectedVendorId(null)}
                className="text-sm font-semibold text-white/90 hover:text-white underline underline-offset-4"
              >
                선택 해제
              </button>
            </div>
            <div className="mt-3">
              <VendorCard vendor={selectedVendor} variant="glass" />
            </div>
          </Reveal>
        )}
      </section>

      {/* 리스트 */}
      <section className="mt-10 pb-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4 flex-wrap text-shadow">
            <div>
              <div className="text-base text-white/90">리스트</div>
              <div className="mt-1 text-xl font-semibold text-white">
                {loading ? '로딩 중…' : `총 ${vendors.length}개 · ${currentPage}/${totalPages} 페이지`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/15 transition-colors text-sm font-semibold text-white text-shadow"
              >
                이전
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/15 transition-colors text-sm font-semibold text-white text-shadow"
              >
                다음
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-14 text-white/90 text-shadow text-lg">로딩 중...</div>
          ) : errorMessage ? (
            <div className="flex items-center justify-center py-14 text-white/90 text-shadow text-lg text-center">
              <div>
                <div className="font-semibold">업체 데이터를 불러오지 못했어요.</div>
                <div className="mt-2 text-sm text-white/80">{errorMessage}</div>
              </div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex items-center justify-center py-14 text-white/90 text-shadow text-lg">
              조건에 맞는 업체가 없습니다.
            </div>
          ) : (
            <>
              {/* 큰 블록으로 묶어서 정리 */}
              <div className="panel-contrast rounded-3xl border border-white/20 overflow-hidden">
                <div className="px-5 py-4 text-sm text-white/90 text-shadow border-b border-white/15 flex items-center justify-between">
                  <span>현재 페이지 업체</span>
                  <span className="text-white/85">리스트 클릭 → 상세 가격표</span>
                </div>
                <div className="divide-y divide-white/10">
                  {pagedVendors.map((v) => {
                    const mm = getMinMax(v)
                    const hasGeo = !!geoByVendorId[v.id]
                    return (
                      <div
                        key={v.id}
                        className={`px-5 py-4 transition-colors ${
                          v.id === selectedVendorId ? 'bg-white/7' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* 리스트 클릭은 상세로 이동 */}
                          <Link href={`/vendors/${v.id}`} className="min-w-0 flex-1 hover:opacity-95">
                            <div className="text-lg font-semibold text-white text-shadow">{v.name}</div>
                            <div className="mt-1 text-sm text-white/90 text-shadow">
                              {CategoryLabels[v.category]} · {RegionLabels[v.region]}
                              {v.address ? ` · ${v.address}` : ''}
                            </div>
                          </Link>

                          <div className="shrink-0 text-right">
                            {mm.min === null ? (
                              <div className="text-sm text-white/80 text-shadow">가격 정보 없음</div>
                            ) : (
                              <div className="text-sm text-white text-shadow">
                                <span className="font-semibold">{formatPrice(mm.min)}원</span>
                                {mm.max !== null && mm.max !== mm.min && (
                                  <span className="text-white/85"> ~ {formatPrice(mm.max)}원</span>
                                )}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => hasGeo && setSelectedVendorId(v.id)}
                              disabled={!hasGeo}
                              className="mt-2 px-3 py-1.5 rounded-full border border-white/35 bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors text-xs font-semibold text-white text-shadow"
                              title={hasGeo ? '지도에서 선택' : '좌표 없음'}
                            >
                              지도에서 보기
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 페이지 번호(간단) */}
              <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                {Array.from({ length: totalPages }).slice(0, 12).map((_, idx) => {
                  const p = idx + 1
                  const active = p === currentPage
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-full border text-sm font-semibold transition-colors text-shadow ${
                        active
                          ? 'border-white/70 bg-white/25 text-white'
                          : 'border-white/35 bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                {totalPages > 12 && <span className="text-sm text-white/85 text-shadow">…</span>}
              </div>
            </>
          )}
        </Reveal>
      </section>
    </main>
  )
}


