'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Vendor } from '@/types'
import { CategoryLabels, RegionLabels } from '@/types'
import Link from 'next/link'
import Reveal from '@/components/Reveal'

export default function VendorDetailPage() {
  const params = useParams()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchVendor(params.id as string)
    }
  }, [params.id])

  const fetchVendor = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vendors/${id}`)
      const data = await response.json()
      setVendor(data)
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/90 text-shadow text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/90 text-shadow text-lg">업체를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="text-shadow">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors text-sm font-semibold text-white"
          >
            ← 업체 목록
          </Link>

          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-white bg-white/15 border border-white/30 px-2 py-1 rounded-full">
              {CategoryLabels[vendor.category]}
            </span>
            <span className="text-xs font-medium text-white/90">
              {RegionLabels[vendor.region]}
            </span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {vendor.name}
          </h1>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="panel-contrast rounded-3xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white text-shadow">기본 정보</h2>
          <div className="mt-4 space-y-4 text-shadow">
            {vendor.description && (
              <div>
                <div className="text-sm font-semibold text-white/90">설명</div>
                <p className="mt-1 text-white/90">{vendor.description}</p>
              </div>
            )}
            {vendor.address && (
              <div>
                <div className="text-sm font-semibold text-white/90">주소</div>
                <p className="mt-1 text-white/90">{vendor.address}</p>
              </div>
            )}
            {vendor.phone && (
              <div>
                <div className="text-sm font-semibold text-white/90">전화번호</div>
                <p className="mt-1 text-white/90">{vendor.phone}</p>
              </div>
            )}
            {vendor.website && (
              <div>
                <div className="text-sm font-semibold text-white/90">웹사이트</div>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-white underline underline-offset-4"
                >
                  {vendor.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="panel-contrast rounded-3xl p-6 sm:p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white text-shadow">가격표(패키지/옵션)</h2>
          {vendor.items.length === 0 ? (
            <div className="text-white/90 text-shadow text-center py-10">등록된 아이템이 없습니다.</div>
          ) : (
            <div className="mt-6 space-y-6">
              {vendor.items.map((item) => (
                <div key={item.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <div className="text-lg font-semibold text-white text-shadow">{item.name}</div>
                  {item.description && (
                    <p className="mt-2 text-sm text-white/90 text-shadow">{item.description}</p>
                  )}
                  {item.prices.length === 0 ? (
                    <div className="mt-3 text-sm text-white/80 text-shadow">가격 정보가 없습니다.</div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.prices.map((price) => (
                        <div
                          key={price.id}
                          className="rounded-2xl border border-white/20 bg-white/10 p-4 hover:bg-white/15 transition-colors"
                        >
                          {price.name && (
                            <div className="text-sm font-semibold text-white/90 text-shadow">
                              {price.name}
                            </div>
                          )}
                          <div className="mt-2 text-2xl font-bold text-white text-shadow">
                            {formatPrice(price.price)}원
                          </div>
                          {price.description && (
                            <div className="mt-2 text-xs text-white/80 text-shadow">{price.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </main>
  )
}


