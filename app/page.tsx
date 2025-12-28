'use client'

import FilterBar from '@/components/FilterBar'
import PhotoCards from '@/components/PhotoCards'
import PriceGoStats from '@/components/PriceGoStats'
import Reveal from '@/components/Reveal'
import VendorCard from '@/components/VendorCard'
import { Category, CategoryLabels, Region, Vendor } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedRegion) params.append('region', selectedRegion)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      const response = await fetch(`/api/vendors?${params.toString()}`)
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [maxPrice, minPrice, selectedCategory, selectedRegion])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const categoryOrder: Category[] = [
    Category.STUDIO,
    Category.DRESS,
    Category.MAKEUP,
    Category.WEDDING_HALL,
  ]

  const buildVendorsQuery = (category?: Category | null) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (selectedRegion) params.set('region', selectedRegion)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          <Reveal className="panel rounded-[32px] p-7 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-white/70" aria-hidden="true" />
              가격 공개 시대 · 한 번에 비교
            </div>

            <h1 className="mt-5 text-[46px] sm:text-6xl font-extrabold leading-[0.95] tracking-tight text-white text-shadow">
              결혼업체
              <span className="ml-2 outline-text">가격</span>
              <br />
              더 투명하고, 더 쉽게.
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/90 max-w-[52ch] text-shadow">
              그동안 비공개라 어려웠던 결혼 비용.
              이제는 정부의 가격공개 의무화로 정보가 열리고 있어요.
              Weddit Lite는 스튜디오·드레스·메이크업·웨딩홀 가격을
              <span className="font-semibold text-white/90"> 업체별/카테고리별로 비교</span>하고,
              <span className="font-semibold text-white/90"> 옵션·추가비용</span>까지 한 번에 확인하게 해줍니다.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <a
                href="#compare"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors font-semibold whitespace-nowrap"
              >
                바로 비교하기 <span aria-hidden="true">→</span>
              </a>
              <a
                href="#stories"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border border-white/30 bg-white/10 hover:bg-white/15 transition-colors text-white/85 whitespace-nowrap"
              >
                가이드 보기
              </a>
            </div>

            <div className="mt-8 soft-divider pt-6 grid grid-cols-3 gap-3">
              <div className="panel rounded-2xl px-4 py-3">
                <div className="text-xs text-white/85">업체</div>
                <div className="text-lg font-semibold text-white text-shadow">
                  {loading ? '—' : `${vendors.length}개`}
                </div>
              </div>
              <div className="panel rounded-2xl px-4 py-3">
                <div className="text-xs text-white/85">카테고리</div>
                <div className="text-lg font-semibold text-white text-shadow">4종</div>
              </div>
              <div className="panel rounded-2xl px-4 py-3">
                <div className="text-xs text-white/85">지역</div>
                <div className="text-lg font-semibold text-white text-shadow">전국</div>
              </div>
            </div>
          </Reveal>

          <Reveal className="panel rounded-[32px] overflow-hidden relative">
            <div className="relative h-[420px] sm:h-[520px]">
              <Image
                src="/mockImage/wedding1.png"
                alt="결혼 사진"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/5" />

              <div className="absolute left-5 top-5 panel rounded-2xl px-4 py-3">
                <div className="text-xs text-white/85">비교 흐름</div>
                <div className="text-base font-semibold text-white text-shadow">가격 → 옵션(추가금) → 결정</div>
              </div>

              <div className="absolute right-5 top-5 panel rounded-2xl px-3 py-2">
                <span className="text-sm text-white/90 text-shadow">실시간 업데이트</span>
              </div>

              <div className="absolute left-5 bottom-5 right-5">
                <div className="panel rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-sm text-white/90 text-shadow">체크 포인트</div>
                    <div className="mt-1 text-lg sm:text-xl font-semibold text-white text-shadow">
                      “옵션/추가금”을 먼저 확인하세요
                    </div>
                  </div>
                  <a
                    href="#stats"
                    className="px-4 py-2 rounded-full border border-white/55 bg-white/20 hover:bg-white/25 transition-colors text-sm font-semibold text-white"
                  >
                    공공 통계 보기 →
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 소개 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <Reveal>
          <div className="text-shadow">
            <div className="text-base text-white/90">서비스 소개</div>
            <h2 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              가격 비교의 기준을 “투명함”으로
            </h2>
            <p className="mt-3 text-lg text-white/90 leading-relaxed max-w-[72ch]">
              Weddit Lite는 공개되는 정보를 “보기 좋게” 정리합니다.
              <span className="font-semibold"> 카테고리별 평균 범위</span>부터
              <span className="font-semibold"> 업체별 가격표</span>,
              그리고 <span className="font-semibold">옵션/추가비용(담당자 지정·야외 촬영·시간 추가 등)</span>까지
              한 화면에서 비교할 수 있게 만드는 것이 목표입니다.
            </p>
          </div>
        </Reveal>
      </section>

      {/* 통계 */}
      <section id="stats" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <Reveal>
          <PriceGoStats />
        </Reveal>
      </section>

      {/* 포토카드 */}
      <section id="stories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-base text-white/90 text-shadow">가이드</div>
              <h2 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white text-shadow">
                추가금/옵션 체크리스트
              </h2>
              <p className="mt-2 text-lg text-white/90 text-shadow">
                업체 비교 전에 “추가비용”부터 체크하면 예산 오차가 줄어들어요.
              </p>
            </div>
            <a
              href="#compare"
              className="px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors text-sm font-semibold text-white"
            >
              비교하러 가기 →
            </a>
          </div>
          <div className="mt-6">
            <PhotoCards />
          </div>
        </Reveal>
      </section>

      {/* 비교 */}
      <section id="compare" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 pb-16">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-base text-white/90 text-shadow">가격 비교</div>
              <h2 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white text-shadow">
                조건을 고르고, 가격표를 확인하세요
              </h2>
              <p className="mt-2 text-lg text-white/90 text-shadow">
                카테고리/지역/가격 범위를 정하면, 업체별 최저~최고가를 바로 비교할 수 있어요.
              </p>
            </div>
            <Link
              href={`/vendors${buildVendorsQuery(selectedCategory)}`}
              className="px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors text-sm font-semibold text-white text-shadow"
            >
              전체 업체 보기 →
            </Link>
          </div>

          <div className="mt-6">
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
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white text-shadow text-lg">로딩 중...</div>
              </div>
            ) : vendors.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white text-shadow text-lg">조건에 맞는 업체가 없습니다.</div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-lg text-white text-shadow">
                  총 {vendors.length}개의 업체를 찾았습니다
                </div>

                {(selectedCategory ? [selectedCategory] : categoryOrder).map((cat) => {
                  const list =
                    selectedCategory ? vendors : vendors.filter((v) => v.category === cat)
                  if (list.length === 0) return null
                  const shown = list.slice(0, 9)
                  const hasMore = list.length > 9

                  return (
                    <div key={cat} className="mb-10">
                      <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm text-white/90 text-shadow">카테고리별</div>
                          <div className="mt-1 text-2xl font-semibold text-white text-shadow">
                            {CategoryLabels[cat]}
                            <span className="ml-2 text-base font-normal text-white/90">
                              (홈에서는 최대 9개)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white/85 text-shadow">
                            {list.length}개
                          </span>
                          {hasMore && (
                            <Link
                              href={`/vendors${buildVendorsQuery(cat)}`}
                              className="px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors text-sm font-semibold text-white text-shadow"
                            >
                              더 보기 →
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                        {shown.map((vendor) => (
                          <VendorCard key={vendor.id} vendor={vendor} variant="glass" />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  )
}
