'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import KakaoMap, { MapMarker } from '@/components/KakaoMap'
import Reveal from '@/components/Reveal'
import FilterBar from '@/components/FilterBar'
import VendorCard from '@/components/VendorCard'
import { Category, CategoryLabels, Region, RegionLabels, Vendor } from '@/types'

function parseCategory(v: string | null): Category | null {
  if (!v) return null
  return (Object.values(Category) as string[]).includes(v) ? (v as Category) : null
}

function parseRegion(v: string | null): Region | null {
  if (!v) return null
  return (Object.values(Region) as string[]).includes(v) ? (v as Region) : null
}

export default function V2VendorsPageClient() {
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
      if (!Array.isArray(data)) throw new Error('서버 응답 형식이 올바르지 않습니다.')
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

  useEffect(() => {
    setPage(1)
    setSelectedVendorId(null)
  }, [selectedCategory, selectedRegion, minPrice, maxPrice])

  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedVendors = vendors.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedVendor = useMemo(() => vendors.find((v) => v.id === selectedVendorId) || null, [selectedVendorId, vendors])

  // 업체명 + 지역으로 좌표 획득
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

  const formatPrice = (n: number) => new Intl.NumberFormat('ko-KR').format(n)
  const getMinMax = (v: Vendor) => {
    const all = v.items.flatMap((it) => it.prices.map((p) => p.price))
    if (!all.length) return { min: null as number | null, max: null as number | null }
    return { min: Math.min(...all), max: Math.max(...all) }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div>
          <div className="text-sm text-gray-600">업체 찾기</div>
          <div className="mt-1 flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              지도에서 보고, 리스트로 비교하기
            </h1>
            <Link
              href="/v2"
              className="px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-900"
            >
              ← v2 홈
            </Link>
          </div>
          <p className="mt-3 text-lg text-gray-700 max-w-[72ch]">
            핀을 눌러 업체를 선택하면 프리뷰가 뜨고, 프리뷰/리스트를 누르면 상세 가격표로 이동합니다.
          </p>
        </div>
      </Reveal>

      <div className="mt-6">
        <Reveal>
          <FilterBar
            variant="light"
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

      <section className="mt-8">
        <Reveal>
          <div>
            <div className="text-sm text-gray-600">지도</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              업체 위치를 한눈에 보기
            </h2>
            <p className="mt-2 text-base text-gray-600">
              업체명 + 지역으로 검색된 위치를 핀으로 표시합니다. (현재 페이지 기준)
            </p>
          </div>

          <div className="mt-5 rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-3 sm:p-4">
            <div className="rounded-2xl overflow-hidden border border-black/10 h-[420px] bg-white">
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-gray-600">선택한 업체</div>
              <button
                onClick={() => setSelectedVendorId(null)}
                className="text-sm font-semibold text-gray-800 hover:text-gray-900 underline underline-offset-4"
              >
                선택 해제
              </button>
            </div>
            <div className="mt-3">
              <VendorCard vendor={selectedVendor} variant="light" hrefBase="/v2/vendors" />
            </div>
          </Reveal>
        )}
      </section>

      <section className="mt-10 pb-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm text-gray-600">리스트</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {loading ? '로딩 중…' : `총 ${vendors.length}개 · ${currentPage}/${totalPages} 페이지`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-semibold text-gray-900"
              >
                이전
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-semibold text-gray-900"
              >
                다음
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-5">
          {loading ? (
            <div className="py-12 text-gray-600">로딩 중...</div>
          ) : errorMessage ? (
            <div className="py-12 text-gray-600 text-center">
              <div className="font-semibold text-gray-900">업체 데이터를 불러오지 못했어요.</div>
              <div className="mt-2 text-sm">{errorMessage}</div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-12 text-gray-600">조건에 맞는 업체가 없습니다.</div>
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="px-5 py-4 text-sm text-gray-700 border-b border-black/10 flex items-center justify-between">
                <span>현재 페이지 업체</span>
                <span className="text-gray-600">리스트 클릭 → 상세 가격표</span>
              </div>
              <div className="divide-y divide-black/5">
                {pagedVendors.map((v) => {
                  const mm = getMinMax(v)
                  const hasGeo = !!geoByVendorId[v.id]
                  return (
                    <div key={v.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <Link href={`/v2/vendors/${v.id}`} className="min-w-0 flex-1 hover:opacity-95">
                          <div className="text-lg font-semibold text-gray-900">{v.name}</div>
                          <div className="mt-1 text-sm text-gray-600">
                            {CategoryLabels[v.category]} · {RegionLabels[v.region]}
                            {v.address ? ` · ${v.address}` : ''}
                          </div>
                        </Link>

                        <div className="shrink-0 text-right">
                          {mm.min === null ? (
                            <div className="text-sm text-gray-600">가격 정보 없음</div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              <span className="font-semibold">{formatPrice(mm.min)}원</span>
                              {mm.max !== null && mm.max !== mm.min && (
                                <span className="text-gray-600"> ~ {formatPrice(mm.max)}원</span>
                              )}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => hasGeo && setSelectedVendorId(v.id)}
                            disabled={!hasGeo}
                            className="mt-2 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors text-xs font-semibold text-gray-900 whitespace-nowrap"
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
          )}
        </Reveal>
      </section>
    </main>
  )
}


